import { getConnection } from "../connection";
import {
  Account,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import BN from "bn.js";

import { decodePoolState, PoolState } from "@project-serum/pool";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createAccount } from "@/utils/account";
import { POOL_REQUEST_TAG, ETF_PROGRAM_ID } from "@/utils/etf/constants";
import { sendAndConfirmTransaction } from "@/utils/sendAndConfirmTx";
import { sleep } from './sleep';

const createTempUserTokenAccountPubkeys = async (
  poolState: PoolState,
  connection: Connection,
  userAccount: Account
) =>
  await Promise.all(
    poolState.assets.map(async (asset, index) => {
      const tokenMint = new Token(
        connection,
        asset.mint,
        TOKEN_PROGRAM_ID,
        userAccount
      );
      await sleep(1.5 + index);
      return await tokenMint.createAccount(userAccount.publicKey);
    })
  );

export const redeemShares = async (
  userSecret: string,
  etfAddress: string,
  shareAmount: number,
  userPoolTokenAccPubkeyString: string
) => {
  if (
    !userSecret ||
    !etfAddress ||
    !shareAmount ||
    !userPoolTokenAccPubkeyString
  ) {
    throw new Error("Invalid input");
  }
  const etfPubkey = new PublicKey(etfAddress);
  const connection = getConnection();
  const raw = await connection.getParsedAccountInfo(etfPubkey, "singleGossip");
  if (!raw?.value?.data || !Buffer.isBuffer(raw.value.data)) {
    throw new Error("No ETF at given address");
  }
  const poolState = decodePoolState(raw.value.data);

  const userAccount = await createAccount(userSecret);

  const userPoolTokenAccPubkey = new PublicKey(userPoolTokenAccPubkeyString);

  const userTokenAccountPubkeys = await createTempUserTokenAccountPubkeys(
    poolState,
    connection,
    userAccount
  );

  const REQUEST_INNER_REDEEM = [
    2,
    1,
    ...new BN(shareAmount, 10).toArray("le", 8)
  ];

  const vaultAuthority = await PublicKey.findProgramAddress(
    [etfPubkey.toBuffer()],
    ETF_PROGRAM_ID
  );

  await sleep(1.5);

  const redeemSharesIx = new TransactionInstruction({
    keys: [
      {
        pubkey: etfPubkey,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: poolState.poolTokenMint,
        isSigner: false,
        isWritable: true
      },
      ...poolState.assets.map(asset => ({
        pubkey: asset.vaultAddress,
        isSigner: false,
        isWritable: true
      })),
      {
        pubkey: vaultAuthority[0],
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: userPoolTokenAccPubkey,
        isSigner: false,
        isWritable: true
      },
      ...userTokenAccountPubkeys.map(key => ({
        pubkey: key,
        isSigner: false,
        isWritable: true
      })),
      { pubkey: userAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ],
    programId: ETF_PROGRAM_ID,
    data: Buffer.from([...POOL_REQUEST_TAG, ...REQUEST_INNER_REDEEM])
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(redeemSharesIx),
    userAccount
  );
};
