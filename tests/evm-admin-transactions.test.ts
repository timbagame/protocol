import { expect, test } from "bun:test";
import { decodeFunctionData, erc20Abi, getAddress, type Address } from "viem";
import {
  invalidateCreationNonceTransaction,
  timbaAbi,
  tokenApprovalTransaction,
} from "../src/evm/v0.1.0/index.js";
import type { EvmDeployment } from "../src/evm/index.js";

const deployment: EvmDeployment = {
  version: "0.1.0",
  chainId: 8453,
  address: "0x00000000000000000000000000000000000000aa",
};
const token: Address = "0x00000000000000000000000000000000000000bb";

test("targets the deployment to invalidate creation nonces", () => {
  const tx = invalidateCreationNonceTransaction(deployment, 7n);
  expect(tx).toMatchObject({
    chainId: 8453,
    to: getAddress(deployment.address),
    value: 0n,
  });
  expect(decodeFunctionData({ abi: timbaAbi, data: tx.data })).toEqual({
    functionName: "invalidateCreationNonce",
    args: [7n],
  });
});

test("approves the deployment as spender on the token contract", () => {
  const amount = 2n ** 256n - 1n;
  const tx = tokenApprovalTransaction(deployment, token, amount);
  expect(tx).toMatchObject({
    chainId: 8453,
    to: getAddress(token),
    value: 0n,
  });
  expect(decodeFunctionData({ abi: erc20Abi, data: tx.data })).toEqual({
    functionName: "approve",
    args: [getAddress(deployment.address), amount],
  });
});
