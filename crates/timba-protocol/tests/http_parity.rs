//! Replays `fixtures/http.json`: every HTTP schema, run with zod on a valid sample, on
//! mutations of it and on edge values. Rust must accept and reject the same inputs, produce
//! the same output (key order included) and report the same first issue path.

use serde_json::{json, Map, Value};
use timba_protocol::http::{bot, common, indexer, oracle, web, Endpoint};
use timba_protocol::schema::{parse, to_js_json, Schema};

fn fixtures() -> Value {
    serde_json::from_str(include_str!("fixtures/http.json")).unwrap()
}

/// TypeScript export name (or contract path) to the Rust schema.
fn registry() -> Vec<(&'static str, &'static Schema)> {
    vec![
        ("ApiErrorSchema", &common::API_ERROR),
        ("Base64TransactionSchema", &common::BASE64_TRANSACTION),
        ("Hex32Schema", &common::HEX32),
        ("NonNegativeIntegerSchema", &common::NON_NEGATIVE_INTEGER),
        ("NullablePriceUsdSchema", &common::NULLABLE_PRICE_USD),
        ("PositiveIntegerSchema", &common::POSITIVE_INTEGER),
        ("ServiceEnvelopeSchema", &common::SERVICE_ENVELOPE),
        ("ServiceMetadataSchema", &common::SERVICE_METADATA),
        ("SimpleApiErrorSchema", &common::SIMPLE_API_ERROR),
        ("SlotSchema", &common::SLOT),
        ("SolanaAddressSchema", &common::SOLANA_ADDRESS),
        ("SolanaSignatureSchema", &common::SOLANA_SIGNATURE),
        ("U64StringSchema", &common::U64_STRING),
        ("UnixTimestampSchema", &common::UNIX_TIMESTAMP),
        ("CompleteGameNowRequestSchema", &oracle::COMPLETE_GAME_NOW_REQUEST),
        ("CompleteGameNowResponseSchema", &oracle::COMPLETE_GAME_NOW_RESPONSE),
        ("CreationPolicyRejectionCodeSchema", &oracle::CREATION_POLICY_REJECTION_CODE),
        ("CreationPolicyRejectionSchema", &oracle::CREATION_POLICY_REJECTION),
        ("GenerateHashRequestSchema", &oracle::GENERATE_HASH_REQUEST),
        ("GenerateHashResponseSchema", &oracle::GENERATE_HASH_RESPONSE),
        ("OracleHealthResponseSchema", &oracle::ORACLE_HEALTH_RESPONSE),
        ("OracleStatsResponseSchema", &oracle::ORACLE_STATS_RESPONSE),
        ("OracleStatsSchema", &oracle::ORACLE_STATS),
        ("SignGameTransactionRequestSchema", &oracle::SIGN_GAME_TRANSACTION_REQUEST),
        ("SignGameTransactionResponseSchema", &oracle::SIGN_GAME_TRANSACTION_RESPONSE),
        ("TokenPoliciesResponseSchema", &oracle::TOKEN_POLICIES_RESPONSE),
        ("TokenPolicySchema", &oracle::TOKEN_POLICY),
        // Fields only used inside objects, run on the edge values too.
        ("TokenPolicySchema.effectiveAt", &Schema::DateTime),
        ("GenerateHashRequestSchema.gameType", &Schema::Optional(&Schema::TrimLower { min: 1, max: 128 })),
        ("VerifiedGameSchema.explorerUrl", &Schema::Url),
        ("BackfillCommitRequestSchema", &indexer::BACKFILL_COMMIT_REQUEST),
        ("BackfillConflictResponseSchema", &indexer::BACKFILL_CONFLICT_RESPONSE),
        ("BackfillRetryableErrorSchema", &indexer::BACKFILL_RETRYABLE_ERROR),
        ("BackfillStateResponseSchema", &indexer::BACKFILL_STATE_RESPONSE),
        ("GameByKeyQuerySchema", &indexer::GAME_BY_KEY_QUERY),
        ("GameStatusSchema", &indexer::GAME_STATUS),
        ("GameTypeSchema", &indexer::GAME_TYPE),
        ("GamesQuerySchema", &indexer::GAMES_QUERY),
        ("HistoricalBackfillStateSchema", &indexer::HISTORICAL_BACKFILL_STATE),
        ("HistoricalClosedEventSchema", &indexer::HISTORICAL_CLOSED_EVENT),
        ("HistoricalCompletedEventSchema", &indexer::HISTORICAL_COMPLETED_EVENT),
        ("HistoricalGameEventPageSchema", &indexer::HISTORICAL_GAME_EVENT_PAGE),
        ("HistoricalInitializedEventSchema", &indexer::HISTORICAL_INITIALIZED_EVENT),
        ("HistoricalMembershipEventSchema", &indexer::HISTORICAL_MEMBERSHIP_EVENT),
        ("HistoricalOperatorClosedEventSchema", &indexer::HISTORICAL_OPERATOR_CLOSED_EVENT),
        ("IndexerActiveGameSchema", &indexer::INDEXER_ACTIVE_GAME),
        ("IndexerActiveGamesResponseSchema", &indexer::INDEXER_ACTIVE_GAMES_RESPONSE),
        ("IndexerGameSchema", &indexer::INDEXER_GAME),
        ("IndexerGamesResponseSchema", &indexer::INDEXER_GAMES_RESPONSE),
        ("IndexerHealthResponseSchema", &indexer::INDEXER_HEALTH_RESPONSE),
        ("IndexerLeaderboardPlayerSchema", &indexer::INDEXER_LEADERBOARD_PLAYER),
        ("IndexerLeaderboardResponseSchema", &indexer::INDEXER_LEADERBOARD_RESPONSE),
        ("IndexerPlayerGamesResponseSchema", &indexer::INDEXER_PLAYER_GAMES_RESPONSE),
        ("IndexerPlayerProfileSchema", &indexer::INDEXER_PLAYER_PROFILE),
        ("IndexerStatsResponseSchema", &indexer::INDEXER_STATS_RESPONSE),
        ("IndexerTokenFinancialStatsSchema", &indexer::INDEXER_TOKEN_FINANCIAL_STATS),
        ("IndexerTokenSummarySchema", &indexer::INDEXER_TOKEN_SUMMARY),
        ("IndexerTokensResponseSchema", &indexer::INDEXER_TOKENS_RESPONSE),
        ("IndexerTriggerErrorSchema", &indexer::INDEXER_TRIGGER_ERROR),
        ("IndexerTriggerResponseSchema", &indexer::INDEXER_TRIGGER_RESPONSE),
        ("LatestGamesQuerySchema", &indexer::LATEST_GAMES_QUERY),
        ("PaginationQuerySchema", &indexer::PAGINATION_QUERY),
        ("PlayerQuerySchema", &indexer::PLAYER_QUERY),
        ("indexerContract.stats.query", &indexer::STATS_QUERY),
        ("indexerContract.playerActiveGames.query", &indexer::PLAYER_ADDRESS_QUERY),
        ("indexerContract.playerProfile.query", &indexer::PLAYER_ADDRESS_QUERY),
        ("indexerContract.leaderboard.query", &indexer::LEADERBOARD_QUERY),
        ("indexerContract.latestGames.responses.200", &indexer::LATEST_GAMES_RESPONSE),
        ("CreateGameRequestSchema", &web::CREATE_GAME_REQUEST),
        ("FinalizedVerifiedGameSchema", &web::FINALIZED_VERIFIED_GAME),
        ("GameAddressParamsSchema", &web::GAME_ADDRESS_PARAMS),
        ("GameConfigResponseSchema", &web::GAME_CONFIG_RESPONSE),
        ("GameTokenConfigSchema", &web::GAME_TOKEN_CONFIG),
        ("PrepareGameResponseSchema", &web::PREPARE_GAME_RESPONSE),
        ("SerializedGameSchema", &web::SERIALIZED_GAME),
        ("SubmitGameRequestSchema", &web::SUBMIT_GAME_REQUEST),
        ("SubmitGameResponseSchema", &web::SUBMIT_GAME_RESPONSE),
        ("VerifiedGameSchema", &web::VERIFIED_GAME),
        ("VerifyGameParamsSchema", &web::VERIFY_GAME_PARAMS),
        ("VerifyGameRequestSchema", &web::VERIFY_GAME_REQUEST),
        ("webContract.game.query", &web::GAME_QUERY),
        ("BotHealthResponseSchema", &bot::BOT_HEALTH_RESPONSE),
        ("CompletedGameNotificationResponseSchema", &bot::COMPLETED_GAME_NOTIFICATION_RESPONSE),
        ("CompletedGameNotificationSchema", &bot::COMPLETED_GAME_NOTIFICATION),
    ]
}

fn schema(name: &str) -> &'static Schema {
    registry().into_iter().find(|(key, _)| *key == name).unwrap_or_else(|| panic!("no Rust schema for {name}")).1
}

/// `MUTATIONS[op]` from the generator; `None` when the op does not apply to `value`.
fn mutation(op: &str, value: &Value) -> Option<Value> {
    Some(match op {
        "null" => Value::Null,
        "emptyString" => json!(""),
        "zero" => json!(0),
        "negative" => json!(-1),
        "fraction" => json!(1.5),
        "true" => json!(true),
        "emptyArray" => json!([]),
        "emptyObject" => json!({}),
        "huge" => json!(1e300),
        "word" => json!("x"),
        "extraKey" => {
            let mut object = value.as_object()?.clone();
            object.insert("extra".into(), json!(1));
            Value::Object(object)
        }
        "duplicateItem" => {
            let items = value.as_array()?;
            Value::Array(items.iter().chain(items).cloned().collect())
        }
        other => panic!("unknown op {other}"),
    })
}

fn child<'a>(value: &'a mut Value, key: &str) -> &'a mut Value {
    if value.is_array() {
        &mut value[key.parse::<usize>().unwrap()]
    } else {
        &mut value[key]
    }
}

/// Applies `op` at the "/"-joined `path` ("" is the root).
fn mutate(sample: &Value, path: &str, op: &str) -> Value {
    let mut copy = sample.clone();
    let keys: Vec<&str> = if path.is_empty() { vec![] } else { path.split('/').collect() };
    let Some((last, parents)) = keys.split_last() else {
        return mutation(op, sample).expect("generator only records applicable ops");
    };
    let parent = parents.iter().fold(&mut copy, |value, key| child(value, key));
    if op == "delete" {
        parent.as_object_mut().unwrap().shift_remove(*last);
    } else {
        let target = child(parent, last);
        *target = mutation(op, target).expect("generator only records applicable ops");
    }
    copy
}

/// Checks one zod result: `1`, `{ output }` or the first issue path.
fn check(schema: &'static Schema, input: &Value, expected: &Value, name: &str) {
    let label = format!("{name} {}", to_js_json(input).chars().take(300).collect::<String>());
    match (parse(schema, input), expected) {
        (Ok(output), Value::Number(_)) => assert_eq!(to_js_json(&output), to_js_json(input), "output of {label}"),
        (Ok(output), Value::Object(expected)) => {
            assert_eq!(to_js_json(&output), to_js_json(&expected["output"]), "output of {label}")
        }
        (Err(error), Value::String(issue)) => assert_eq!(&error.path, issue, "issue path of {label}: {error}"),
        (Ok(_), _) => panic!("Rust accepted what zod rejects: {label}"),
        (Err(error), _) => panic!("Rust rejected what zod accepts: {label}: {error}"),
    }
}

/// Undoes the generator's `{ $repeat: [character, length] }` compaction.
fn expand(value: &Value) -> Value {
    match value.get("$repeat").and_then(Value::as_array) {
        Some(repeat) => json!(repeat[0].as_str().unwrap().repeat(repeat[1].as_u64().unwrap() as usize)),
        None => value.clone(),
    }
}

#[test]
fn schemas_match_zod() {
    let fixtures = fixtures();
    let schemas = fixtures["schemas"].as_object().unwrap();
    // `schema(name)` below fails for any fixture without a Rust schema.
    assert_eq!(schemas.len(), 82, "every zod schema has a fixture");
    let mut checked = 0;
    for (name, fixture) in schemas {
        let schema = schema(name);
        let samples = fixture["samples"].as_array().unwrap();
        for case in fixture["cases"].as_array().unwrap() {
            let sample = &samples[case[0].as_u64().unwrap() as usize];
            let input = match case[2].as_str().unwrap() {
                "" => sample.clone(),
                op => mutate(sample, case[1].as_str().unwrap(), op),
            };
            check(schema, &input, &case[3], name);
            checked += 1;
        }
        for edge in fixture["edges"].as_array().unwrap() {
            check(schema, &expand(&edge[0]), &edge[1], name);
            checked += 1;
        }
    }
    assert!(checked > 10_000, "{checked} cases");
}

fn name_of(schema: &'static Schema) -> Vec<&'static str> {
    registry().into_iter().filter(|(_, candidate)| std::ptr::eq(*candidate, schema)).map(|(name, _)| name).collect()
}

fn check_slot(slot: Option<&'static Schema>, expected: &Value, label: &str) {
    match (slot, expected.as_str()) {
        (None, None) => {}
        (Some(schema), Some(name)) => assert!(name_of(schema).contains(&name), "{label}: expected {name}"),
        _ => panic!("{label}: slot mismatch"),
    }
}

#[test]
fn contracts_match_typescript() {
    let fixtures = fixtures();
    let contracts: [(&str, &[(&str, Endpoint)]); 5] = [
        ("oracleContract", oracle::ORACLE_CONTRACT),
        ("indexerContract", indexer::INDEXER_CONTRACT),
        ("webContract", web::WEB_CONTRACT),
        ("botContract", bot::BOT_CONTRACT),
        ("unused", &[]),
    ];
    let expected = fixtures["contracts"].as_object().unwrap();
    assert_eq!(expected.len(), 4);
    for (name, contract) in &contracts[..4] {
        let endpoints = expected[*name].as_object().unwrap();
        let names: Vec<&str> = contract.iter().map(|(key, _)| *key).collect();
        assert_eq!(names, endpoints.keys().map(String::as_str).collect::<Vec<_>>(), "{name} endpoints");
        for (key, endpoint) in contract.iter() {
            let fixture = &endpoints[*key];
            let label = format!("{name}.{key}");
            assert_eq!(endpoint.method, fixture["method"], "{label}");
            assert_eq!(endpoint.path, fixture["path"], "{label}");
            assert_eq!(endpoint.authenticated, fixture["authenticated"], "{label}");
            check_slot(endpoint.params, &fixture["params"], &label);
            check_slot(endpoint.query, &fixture["query"], &label);
            check_slot(endpoint.body, &fixture["body"], &label);
            let responses: &Map<String, Value> = fixture["responses"].as_object().unwrap();
            assert_eq!(endpoint.responses.len(), responses.len(), "{label} statuses");
            for (status, schema) in endpoint.responses {
                check_slot(Some(schema), &responses[&status.to_string()], &format!("{label} {status}"));
                assert!(std::ptr::eq(endpoint.response(*status).unwrap(), *schema));
            }
            assert!(endpoint.response(599).is_none());
        }
    }
    assert!(timba_protocol::http::endpoint(oracle::ORACLE_CONTRACT, "stats").is_some());
    assert!(timba_protocol::http::endpoint(oracle::ORACLE_CONTRACT, "missing").is_none());
}
