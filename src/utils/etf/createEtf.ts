import BN from "bn.js";
import {
  TransactionInstruction,
  PublicKey,
  Transaction,
  SystemProgram,
  Account,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import TOKEN_LIST from "../token-list.json";
import { getTokenPricesInUSD } from "../tokenPriceApi";
import { EtfComponent } from "@/utils/etf/etf";
import { createAccount } from "@/utils/account";
import { getConnection, chosenCluster } from "@/utils/connection";
import { sendAndConfirmTransaction } from "@/utils/sendAndConfirmTx";
import { POOL_REQUEST_TAG, ETF_PROGRAM_ID } from "@/utils/etf/constants";

// TODO can be made more efficient
// TODO add external price data and backup data provider before deployment to mainnet
const createVaultAmounts = async (
  components: EtfComponent[],
  shareValueInUsd: number
) => {
  const clusterTokens: {
    tokenSymbol: string;
    mintAddress: string;
    tokenName: string;
    icon: string;
    decimals: number;
    coingeckoId: string;
  }[] = TOKEN_LIST[chosenCluster.value];
  /* const coingeckoIds: string[] = components.map(component => {
    return clusterTokens.filter(
      token => token.tokenSymbol === component.name
    )[0].coingeckoId;
  }); */

  /* const prices = await getTokenPricesInUSD(coingeckoIds); */
  const vaultPartsInUsd = components.map(
    c => shareValueInUsd * (c.percentage / 100)
  );
  return components.map((c, index) => {
    const tokenPrice = /* prices[coingeckoIds[index]].usd; */ 1;
    const tokenAmounts = (vaultPartsInUsd[index] / tokenPrice).toFixed(
      clusterTokens.filter(token => token.tokenSymbol === c.name)[0].decimals
    );
    return new BN(tokenAmounts.replace(".", ""), 10);
  });
};

export const createEtf = async (
  components: EtfComponent[],
  shareValueInUsd: number,
  feePayer: string
) => {
  if (components.length > 30) {
    throw new Error("Can only handle 30 tokens in one ETF at this point");
  }

  const vaultAmounts = await createVaultAmounts(components, shareValueInUsd);

  const feePayerAccount = await createAccount(feePayer);

  const connection = getConnection();

  const space = components.reduce(acc => acc + 72, 93);
  const requiredLamports = await connection.getMinimumBalanceForRentExemption(
    space,
    "singleGossip"
  );

  const poolAccount = new Account();
  const createPoolAccountInstruction = SystemProgram.createAccount({
    fromPubkey: feePayerAccount.publicKey,
    newAccountPubkey: poolAccount.publicKey,
    lamports: requiredLamports,
    space,
    programId: ETF_PROGRAM_ID
  });

  const vaultAuthority = await PublicKey.findProgramAddress(
    [poolAccount.publicKey.toBuffer()],
    ETF_PROGRAM_ID
  );

  const clusterTokens = TOKEN_LIST[chosenCluster.value];
  const chosenTokens = components.map(component => {
    return clusterTokens.filter(
      token => token.tokenSymbol === component.name
    )[0];
  });

  const tokenPubkeys = await Promise.all(
    chosenTokens.map(async token =>
      new Token(
        connection,
        new PublicKey(token.mintAddress),
        TOKEN_PROGRAM_ID,
        feePayerAccount
      ).createAccount(vaultAuthority[0])
    )
  );

  const poolTokenMintAccount = await Token.createMint(
    connection,
    feePayerAccount,
    vaultAuthority[0],
    vaultAuthority[0],
    0,
    TOKEN_PROGRAM_ID
  );

  const VAULT_SIGNER_NONCE = vaultAuthority[1];
  const ASSETS_LENGTH = vaultAmounts.length;
  const BORSH_ETF = [3, 0, 0, 0, 101, 116, 102];

  const INITIALIZE_POOL_REQUEST = [
    VAULT_SIGNER_NONCE,
    ASSETS_LENGTH,
    ...BORSH_ETF,
    ...[
      vaultAmounts.length * 8,
      0,
      0,
      0,
      ...vaultAmounts.flatMap(amount => amount.toArray("le", 8))
    ]
  ];

  const REQUEST_INNER_INITIALIZE = [0, ...INITIALIZE_POOL_REQUEST];

  const createEtfInstruction = new TransactionInstruction({
    keys: [
      { pubkey: poolAccount.publicKey, isSigner: false, isWritable: true },
      {
        pubkey: poolTokenMintAccount.publicKey,
        isSigner: false,
        isWritable: true
      },
      ...tokenPubkeys.map(pubkey => ({
        pubkey,
        isSigner: false,
        isWritable: true
      })),
      { pubkey: vaultAuthority[0], isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ],
    programId: ETF_PROGRAM_ID,
    data: Buffer.from([...POOL_REQUEST_TAG, ...REQUEST_INNER_INITIALIZE])
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(createPoolAccountInstruction, createEtfInstruction),
    feePayerAccount,
    poolAccount
  );

  return poolAccount.publicKey.toBase58();
};
