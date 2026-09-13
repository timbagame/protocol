# Coverage gate

CI requires **85% weighted line coverage** across the handwritten protocol
implementation in `coverage-scope.json`. LCOV line hits are merged by source path
and line number; per-file percentages are not averaged.

Missing, empty, malformed reports and scoped files absent from LCOV fail the gate.
An unloaded file therefore cannot silently disappear from the coverage requirement.
Generated clients, declarations, tests and fixtures are excluded explicitly. The
two chain-specific entrypoint barrels are kept outside the line gate because they
only assemble exports; all protocol behavior and plan serialization remain in scope.

Reports are uploaded even when the gate fails. Changes to protocol behavior must
include tests that keep the weighted result at or above 85%.

Run the same test coverage command as CI, then:

```sh
python3 scripts/check-coverage.py coverage-scope.json coverage/lcov.info
```

The explicit exclusions cover generated contract bindings, type-only declarations
and export-only barrels; schema and serialization implementations remain in scope.
