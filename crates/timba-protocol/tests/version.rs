//! The crate and the npm package release one protocol version together.

#[test]
fn crate_version_matches_the_npm_package() {
    let package: serde_json::Value = serde_json::from_str(include_str!("../../../package.json")).unwrap();
    assert_eq!(package["version"], env!("CARGO_PKG_VERSION"));
}
