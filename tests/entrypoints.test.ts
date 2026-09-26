import { expect, test } from "bun:test";
import * as root from "../src/index.js";
import * as bot from "../src/bot/index.js";
import * as common from "../src/common/index.js";
import * as indexer from "../src/indexer/index.js";
import * as oracle from "../src/oracle/index.js";
import * as web from "../src/web/index.js";
import * as evm from "../src/evm/index.js";
import * as evmActions from "../src/evm/actions.js";
import * as evmAuthorization from "../src/evm/authorization.js";
import * as evmHttp from "../src/evm/http.js";
import * as plans from "../src/solana/plans/index.js";
import * as contractAdapter from "../src/solana/plans/contract-adapter.js";
import * as createGame from "../src/solana/plans/create-game.js";
import * as serializedGame from "../src/solana/plans/serialized-game.js";
import * as tokenProgram from "../src/solana/plans/token-program.js";
import * as transaction from "../src/solana/plans/transaction.js";
import * as wsol from "../src/solana/plans/wsol.js";

function expectReexports(
  barrel: Record<string, unknown>,
  modules: Record<string, unknown>[],
): void {
  const expected = Object.assign({}, ...modules) as Record<string, unknown>;
  expect(Object.keys(expected).length).toBeGreaterThan(0);
  for (const [name, value] of Object.entries(expected)) {
    expect(barrel[name]).toBe(value);
  }
}

test("re-exports every service contract from the package root", () => {
  expectReexports(root, [common, oracle, indexer, bot, web]);
  expect(root.botContract.completedGame.path).toBe("/internal/completed");
});

test("re-exports EVM helpers and lists only supported contract versions", () => {
  expectReexports(evm, [evmHttp, evmActions, evmAuthorization]);
  expect(evm.SUPPORTED_EVM_CONTRACT_VERSIONS).toEqual(["0.1.0"]);
});

test("re-exports every Solana plan builder", () => {
  expectReexports(plans, [
    tokenProgram,
    wsol,
    transaction,
    contractAdapter,
    serializedGame,
    createGame,
  ]);
});
