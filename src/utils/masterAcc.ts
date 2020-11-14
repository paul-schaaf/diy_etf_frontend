// ONLY FOR DEV AND TESTING

import { Account } from "@solana/web3.js";
import { createAccount } from "./account";

let MASTER_ACCOUNT: Account;

export const createMasterAccount = async () => {
  MASTER_ACCOUNT = await createAccount(
    "radar motor cement wave label train into tennis clerk step negative play"
  );
};

export const getMasterAccount = () => MASTER_ACCOUNT;
