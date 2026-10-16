//! Contract bindings generated from the package ABI (`src/evm/v0.1.0/timba.json`).

alloy_sol_types::sol!(
    #[derive(Debug, PartialEq, Eq)]
    Timba,
    "../../src/evm/v0.1.0/timba.json"
);

pub use Timba::*;

alloy_sol_types::sol! {
    /// The ERC-20 `approve` call used by `tokenApprovalTransaction`.
    function approve(address spender, uint256 amount) returns (bool);
}
