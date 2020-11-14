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
import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import { createAccount } from "@/utils/account";
import { getMasterAccount } from "@/utils/masterAcc";
import { POOL_REQUEST_TAG, ETF_PROGRAM_ID } from "@/utils/etf/constants";
import { sendAndConfirmTransaction } from "@/utils/sendAndConfirmTx";
import { sleep } from "./sleep";

const createTempUserTokenAccountPubkeys = async (
  poolState: PoolState,
  connection: Connection,
  userAccount: Account,
  shareAmount: number,
  masterAcc: Account
) =>
  await Promise.all(
    poolState.assets.map(async (asset, index) => {
      const tokenMint = new Token(
        connection,
        asset.mint,
        TOKEN_PROGRAM_ID,
        userAccount
      );
      const amountBuffer = poolState.customState.slice(
        index * 8,
        (index + 1) * 8
      );
      await sleep(1.5 + index);
      const userTokenAccountPubkey = await tokenMint.createAccount(
        userAccount.publicKey
      );
      // +shareAmount cause it's otherwise somehow not a number
      const amountInBinary = new BN(amountBuffer, undefined, "le")
        .muln(+shareAmount)
        .toString(10);
      await sleep(1.5 + index);
      const amount = new u64(amountInBinary, 10, "be");
      await tokenMint.mintTo(userTokenAccountPubkey, masterAcc, [], amount);
      return userTokenAccountPubkey;
    })
  );

export const buyShares = async (
  userSecret: string,
  etfAddress: string,
  shareAmount: number
) => {
  if (!userSecret || !etfAddress || !shareAmount) {
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

  const poolTokenMint = new Token(
    connection,
    poolState.poolTokenMint,
    TOKEN_PROGRAM_ID,
    userAccount
  );

  await sleep(1);

  const userPoolTokenAccPubkey = await poolTokenMint.createAccount(
    userAccount.publicKey
  );

  const masterAcc = getMasterAccount();

  const userTokenAccountPubkeys = await createTempUserTokenAccountPubkeys(
    poolState,
    connection,
    userAccount,
    shareAmount,
    masterAcc
  );

  await sleep(1);

  const REQUEST_INNER_CREATE = [
    2,
    0,
    ...new BN(shareAmount, 10).toArray("le", 8)
  ];

  const vaultAuthority = await PublicKey.findProgramAddress(
    [etfPubkey.toBuffer()],
    ETF_PROGRAM_ID
  );

  const buySharesIx = new TransactionInstruction({
    keys: [
      {
        pubkey: etfPubkey,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: poolTokenMint.publicKey,
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
    data: Buffer.from([...POOL_REQUEST_TAG, ...REQUEST_INNER_CREATE])
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(buySharesIx),
    userAccount
  );

  await Promise.all(
    poolState.assets.map((asset, index) => {
      const tokenMint = new Token(
        connection,
        asset.mint,
        TOKEN_PROGRAM_ID,
        userAccount
      );

      return tokenMint.closeAccount(
        userTokenAccountPubkeys[index],
        userAccount.publicKey,
        userAccount,
        []
      );
    })
  );

  return userPoolTokenAccPubkey.toBase58();
};
