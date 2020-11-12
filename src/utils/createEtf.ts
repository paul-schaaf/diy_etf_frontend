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

import TOKEN_LIST from "./token-list.json";
import { getTokenPricesInUSD } from "./tokenPriceApi";
import { EtfComponent } from "@/utils/etf";
import { createAccount } from "@/utils/account";
import { getConnection } from "@/utils/connection";
import { sendAndConfirmTransaction } from "@/utils/sendAndConfirmTx";

const PROGRAM_ID = new PublicKey(
  "Gui5kXuxyre7LwyzacJZsM99oHVUXA6AH2kAc8qMKHnb"
);
// u64
const POOL_REQUEST_TAG = [207, 196, 28, 205, 189, 108, 10, 34];

// TODO can be made more efficient
const createVaultAmounts = async (
  components: EtfComponent[],
  shareValueInUsd: number
) => {
  const clusterTokens = TOKEN_LIST.localnet;
  const coingeckoIds = components.map(component => {
    return clusterTokens.filter(
      token => token.tokenSymbol === component.name
    )[0].coingeckoId;
  });

  const prices = await getTokenPricesInUSD(coingeckoIds);
  const vaultPartsInUsd = components.map(
    c => shareValueInUsd * (c.percentage / 100)
  );
  return components.map((c, index) => {
    const tokenPrice = prices[coingeckoIds[index]].usd;
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
  const vaultAmounts = await createVaultAmounts(components, shareValueInUsd);

  const feePayerAccount = await createAccount(feePayer);

  const connection = getConnection();

  const space = 300;
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
    programId: PROGRAM_ID
  });

  const vaultAuthority = await PublicKey.findProgramAddress(
    [poolAccount.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const clusterTokens = TOKEN_LIST.localnet;
  const chosenTokens = components.map(component => {
    return clusterTokens.filter(
      token => token.tokenSymbol === component.name
    )[0];
  });

  const TokenA = new Token(
    connection,
    new PublicKey(chosenTokens[0].mintAddress),
    TOKEN_PROGRAM_ID,
    feePayerAccount
  );
  const tokenATokenAccount = await TokenA.createAccount(vaultAuthority[0]);

  const TokenB = new Token(
    connection,
    new PublicKey(chosenTokens[1].mintAddress),
    TOKEN_PROGRAM_ID,
    feePayerAccount
  );
  const tokenBTokenAccount = await TokenB.createAccount(vaultAuthority[0]);

  const poolTokenMintAccount = await Token.createMint(
    connection,
    feePayerAccount,
    vaultAuthority[0],
    vaultAuthority[0],
    0,
    TOKEN_PROGRAM_ID
  );

  const VAULT_SIGNER_NONCE = vaultAuthority[1];
  const ASSETS_LENGTH = 2;
  const BORSH_ETF = [3, 0, 0, 0, 101, 116, 102];

  const amountTokenA = vaultAmounts[0].toArray("le", 8);
  const amountTokenB = vaultAmounts[1].toArray("le", 8);

  const INITIALIZE_POOL_REQUEST = [
    VAULT_SIGNER_NONCE,
    ASSETS_LENGTH,
    ...BORSH_ETF,
    ...[16, 0, 0, 0, ...amountTokenA, ...amountTokenB]
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
      { pubkey: tokenATokenAccount, isSigner: false, isWritable: true },
      { pubkey: tokenBTokenAccount, isSigner: false, isWritable: true },
      { pubkey: vaultAuthority[0], isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data: Buffer.from([...POOL_REQUEST_TAG, ...REQUEST_INNER_INITIALIZE])
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(createPoolAccountInstruction, createEtfInstruction),
    feePayerAccount,
    poolAccount
  );
};
