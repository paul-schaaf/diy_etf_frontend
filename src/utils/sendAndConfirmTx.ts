import {
  Account,
  Connection,
  sendAndConfirmTransaction as realSendAndConfirmTransaction,
  Transaction
} from "@solana/web3.js";

export function sendAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  ...signers: Account[]
) {
  return realSendAndConfirmTransaction(connection, transaction, signers, {
    skipPreflight: true,
    commitment: "singleGossip"
  });
}
