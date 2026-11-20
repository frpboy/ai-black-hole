# Express API example

This example demonstrates the initial monitor-mode integration. It is a development example, not a production deployment recipe.

From the repository root:

```bash
npm install
npm run build
npm run start --workspace=ai-black-hole-express-example
```

The example listens on port 3000 and exposes `GET /health`. Request observations are written as JSON lines to standard output.

Before production use, configure Express trusted proxies deliberately and provide a stable client identity strategy. The in-memory limiter is process-local and is not a distributed rate limiter. Do not switch to enforce mode without testing legitimate traffic.
