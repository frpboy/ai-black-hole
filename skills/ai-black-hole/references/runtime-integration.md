# Runtime Integration Guidance

1. Identify framework and version from the repository.
2. Read middleware ordering and error-handling conventions.
3. Integrate in monitor mode first.
4. Configure trusted proxy handling explicitly; never trust arbitrary forwarded headers.
5. Redact sensitive values before telemetry.
6. Test middleware ordering, async failures and shutdown.
7. Enable enforcement only after reviewing observed events and false positives.
8. Add a rollback switch for optional controls without removing core application security.
