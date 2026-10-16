//! Rust implementation of `@timbagame/protocol`.
//!
//! The on-chain codecs mirror the Codama-generated TypeScript clients for the
//! v0.2.0 and v0.3.0 Timba program IDLs. The IDLs are read from the TypeScript
//! package's `src/contracts`, and fixtures generated from that package check
//! every builder byte for byte (see `tests/fixtures/README.md`).

pub mod address;
pub mod amounts;
pub mod codec;
pub mod contracts;
pub mod events;
pub mod instruction;
pub mod plans;
pub mod randomness;
pub mod transaction;
pub mod validators;

pub use address::{Address, AddressError};
pub use contracts::ContractVersion;
pub use instruction::{AccountMeta, Instruction};
