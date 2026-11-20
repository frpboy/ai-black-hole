# Getting Started

## Requirements

- Node.js 20 or later.
- npm 10 or later.
- TypeScript 5.8+ for TypeScript projects.

## Install from source

```bash
git clone https://github.com/frpboy/ai-black-hole.git
cd ai-black-hole
npm install
npm run check
```

This repository is an early foundation. Package APIs are under active development and are not yet published to npm. Use the source checkout and examples while the first release is prepared.

## Integration principles

1. Start in monitor mode.
2. Configure trusted proxy handling before using client IP signals.
3. Keep authentication and authorization in the application.
4. Allow legitimate integrations using scoped identities.
5. Enable enforcement only after observing and testing expected traffic.
6. Enable deception only after verifying isolation and resource limits.

## Production checklist

- [ ] Review the threat model.
- [ ] Confirm no secrets are shipped to clients.
- [ ] Confirm sensitive routes enforce server-side authorization.
- [ ] Set application-appropriate rate limits.
- [ ] Define telemetry retention and redaction.
- [ ] Test legitimate users and integrations.
- [ ] Verify decoy isolation and shutdown.
- [ ] Document rollback and emergency disable procedures.
