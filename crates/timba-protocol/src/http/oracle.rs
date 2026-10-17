//! `@timbagame/protocol/oracle`.

use serde_json::Value;

use super::common::{envelope, API_ERROR};
use super::Endpoint;
use crate::schema::{array, Schema, SchemaError};

pub static GENERATE_HASH_REQUEST: Schema =
    Schema::StrictObject(&[("gameType", Schema::Optional(&Schema::TrimLower { min: 1, max: 128 }))]);

pub static GENERATE_HASH_RESPONSE: Schema = envelope!(
    ("success", Schema::BoolLiteral(true)),
    ("randomHash", Schema::Hex32),
    ("gameAddress", Schema::Address),
    ("oracleOperator", Schema::Address),
);

pub static SIGN_GAME_TRANSACTION_REQUEST: Schema =
    Schema::StrictObject(&[("txBase64", Schema::Base64Transaction { max: 16_384 })]);

pub static SIGN_GAME_TRANSACTION_RESPONSE: Schema =
    envelope!(("success", Schema::BoolLiteral(true)), ("txBase64", Schema::Base64Transaction { max: 16_384 }),);

fn accepted_minimum_within_recommended(value: &Value) -> Result<(), SchemaError> {
    let amount = |key: &str| value[key].as_str().and_then(|text| text.parse::<u64>().ok());
    if amount("acceptedMinimumAmountRaw") <= amount("minimumAmountRaw") {
        Ok(())
    } else {
        Err(SchemaError::new("acceptedMinimumAmountRaw", "accepted minimum must not exceed the recommended minimum"))
    }
}

pub static TOKEN_POLICY: Schema = Schema::Refine(
    &Schema::StrictObject(&[
        ("mint", Schema::Address),
        ("enabled", Schema::Bool),
        ("minimumAmountRaw", Schema::U64String),
        ("acceptedMinimumAmountRaw", Schema::U64String),
        ("revision", Schema::NonNegativeInteger),
        ("effectiveAt", Schema::DateTime),
    ]),
    accepted_minimum_within_recommended,
);

pub static TOKEN_POLICIES_RESPONSE: Schema =
    envelope!(("success", Schema::BoolLiteral(true)), ("policies", array(&TOKEN_POLICY)));

pub static CREATION_POLICY_REJECTION_CODES: &[&str] =
    &["unsupported_mint", "token_disabled", "amount_below_minimum", "policy_unavailable"];

pub static CREATION_POLICY_REJECTION_CODE: Schema = Schema::Enum(CREATION_POLICY_REJECTION_CODES);

pub static CREATION_POLICY_REJECTION: Schema = envelope!(
    ("success", Schema::BoolLiteral(false)),
    ("error", crate::schema::NON_EMPTY_STRING),
    ("code", Schema::Enum(CREATION_POLICY_REJECTION_CODES)),
    ("mint", Schema::Optional(&Schema::Address)),
    ("minimumAmountRaw", Schema::Optional(&Schema::U64String)),
    ("acceptedMinimumAmountRaw", Schema::Optional(&Schema::U64String)),
    ("revision", Schema::Optional(&Schema::NonNegativeInteger)),
);

pub static ORACLE_HEALTH_RESPONSE: Schema =
    envelope!(("success", Schema::BoolLiteral(true)), ("status", Schema::Literal("healthy")));

pub static ORACLE_STATS: Schema = Schema::Object(&[
    ("totalSecrets", Schema::NonNegativeInteger),
    ("usedSecrets", Schema::NonNegativeInteger),
    ("pendingGames", Schema::NonNegativeInteger),
    ("completedGames", Schema::NonNegativeInteger),
    ("cancelledGames", Schema::NonNegativeInteger),
    ("eventListening", Schema::Bool),
    ("activeListeners", Schema::NonNegativeInteger),
]);

pub static ORACLE_STATS_RESPONSE: Schema =
    envelope!(("success", Schema::BoolLiteral(true)), ("stats", Schema::Ref(&ORACLE_STATS)));

pub static COMPLETE_GAME_NOW_REQUEST: Schema = Schema::StrictObject(&[("gameAddress", Schema::Address)]);

pub static COMPLETE_GAME_NOW_RESPONSE: Schema = Schema::DiscriminatedUnion {
    key: "status",
    options: &[
        (
            "in-flight",
            envelope!(
                ("success", Schema::BoolLiteral(true)),
                ("gameAddress", Schema::Address),
                ("status", Schema::Literal("in-flight")),
            ),
        ),
        (
            "not-ready",
            envelope!(
                ("success", Schema::BoolLiteral(true)),
                ("gameAddress", Schema::Address),
                ("status", Schema::Literal("not-ready")),
            ),
        ),
        (
            "completed",
            envelope!(
                ("success", Schema::BoolLiteral(true)),
                ("gameAddress", Schema::Address),
                ("status", Schema::Literal("completed")),
                ("txHash", Schema::Signature),
                ("winnerAddress", Schema::Address),
                ("totalPot", Schema::NonNegativeNumber),
            ),
        ),
    ],
};

pub static ORACLE_CONTRACT: &[(&str, Endpoint)] = &[
    ("health", Endpoint::get("/health", false).responses(&[(200, &ORACLE_HEALTH_RESPONSE), (500, &API_ERROR)])),
    (
        "generateHash",
        Endpoint::post("/generate-hash", true).body(&GENERATE_HASH_REQUEST).responses(&[
            (200, &GENERATE_HASH_RESPONSE),
            (400, &API_ERROR),
            (401, &API_ERROR),
            (429, &API_ERROR),
            (500, &API_ERROR),
        ]),
    ),
    (
        "tokenPolicies",
        Endpoint::get("/token-policies", true).responses(&[
            (200, &TOKEN_POLICIES_RESPONSE),
            (401, &API_ERROR),
            (429, &API_ERROR),
            (500, &API_ERROR),
            (503, &API_ERROR),
        ]),
    ),
    (
        "signGameTransaction",
        Endpoint::post("/sign-game-transaction", true).body(&SIGN_GAME_TRANSACTION_REQUEST).responses(&[
            (200, &SIGN_GAME_TRANSACTION_RESPONSE),
            (400, &API_ERROR),
            (401, &API_ERROR),
            (422, &CREATION_POLICY_REJECTION),
            (429, &API_ERROR),
            (500, &API_ERROR),
            (503, &API_ERROR),
        ]),
    ),
    (
        "stats",
        Endpoint::get("/stats", true).responses(&[
            (200, &ORACLE_STATS_RESPONSE),
            (401, &API_ERROR),
            (429, &API_ERROR),
            (500, &API_ERROR),
        ]),
    ),
    (
        "completeGameNow",
        Endpoint::post("/games/complete-now", true).body(&COMPLETE_GAME_NOW_REQUEST).responses(&[
            (200, &COMPLETE_GAME_NOW_RESPONSE),
            (400, &API_ERROR),
            (401, &API_ERROR),
            (404, &API_ERROR),
            (409, &API_ERROR),
            (429, &API_ERROR),
            (500, &API_ERROR),
        ]),
    ),
];

/// The fields of a token policy `evaluate_token_policy` reads.
pub trait TokenPolicyTerms {
    fn mint(&self) -> &str;
    fn enabled(&self) -> bool;
    fn accepted_minimum_amount_raw(&self) -> u64;
}

#[derive(Debug, PartialEq, Eq)]
pub enum TokenPolicyDecision<'a, T> {
    Accepted(&'a T),
    /// `code` is `unsupported_mint`, `token_disabled` or `amount_below_minimum`.
    Rejected {
        code: &'static str,
        policy: Option<&'a T>,
    },
}

/// `evaluateTokenPolicy`: a pure eligibility check; callers own availability, metadata and
/// error presentation.
pub fn evaluate_token_policy<'a, T: TokenPolicyTerms>(
    policies: &'a [T],
    mint: &str,
    amount: Option<u64>,
) -> TokenPolicyDecision<'a, T> {
    let Some(policy) = policies.iter().find(|policy| policy.mint() == mint) else {
        return TokenPolicyDecision::Rejected { code: "unsupported_mint", policy: None };
    };
    if !policy.enabled() {
        return TokenPolicyDecision::Rejected { code: "token_disabled", policy: Some(policy) };
    }
    if amount.is_some_and(|amount| amount < policy.accepted_minimum_amount_raw()) {
        return TokenPolicyDecision::Rejected { code: "amount_below_minimum", policy: Some(policy) };
    }
    TokenPolicyDecision::Accepted(policy)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, PartialEq, Eq)]
    struct Policy {
        mint: &'static str,
        enabled: bool,
        accepted: u64,
    }

    impl TokenPolicyTerms for Policy {
        fn mint(&self) -> &str {
            self.mint
        }
        fn enabled(&self) -> bool {
            self.enabled
        }
        fn accepted_minimum_amount_raw(&self) -> u64 {
            self.accepted
        }
    }

    const MINT: &str = "So11111111111111111111111111111111111111112";

    #[test]
    fn token_policy_keeps_the_accepted_minimum_boundary_and_rejection_order() {
        let policy = || Policy { mint: MINT, enabled: true, accepted: 95 };
        let disabled = || Policy { enabled: false, ..policy() };
        let rejected = |code, policy| TokenPolicyDecision::Rejected { code, policy };

        assert_eq!(evaluate_token_policy::<Policy>(&[], MINT, Some(100)), rejected("unsupported_mint", None));
        let other = [Policy { mint: "other", ..policy() }];
        assert_eq!(evaluate_token_policy(&other, MINT, None), rejected("unsupported_mint", None));
        let disabled = [disabled()];
        assert_eq!(evaluate_token_policy(&disabled, MINT, Some(0)), rejected("token_disabled", Some(&disabled[0])));
        let policies = [policy()];
        assert_eq!(
            evaluate_token_policy(&policies, MINT, Some(94)),
            rejected("amount_below_minimum", Some(&policies[0]))
        );
        assert_eq!(evaluate_token_policy(&policies, MINT, Some(95)), TokenPolicyDecision::Accepted(&policies[0]));
        assert_eq!(evaluate_token_policy(&policies, MINT, None), TokenPolicyDecision::Accepted(&policies[0]));
    }
}
