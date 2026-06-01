# Testing

Run the visit-counter hydration smoke test with:

```sh
node tests/site-visits-hydration.mjs
```

The test serves the static site locally, stubs the Firebase browser modules, and verifies that both `index.html` and `numeros-cartorio.html` avoid rendering a false `0` before the visit count loads.

Run the civil consultation tests with:

```sh
node tests/civil-consultation-core.mjs
node tests/civil-consultation-smoke.mjs
```

The smoke test serves `servicos-online.html`, stubs Firebase browser modules, and verifies the consultation form states without calling the real API.

For manual local testing of the marriage process consultation, run:

```sh
node scripts/civil-dev-server.mjs
```

This serves the static site and exposes a local-only proxy at `/api/local-consulta-habilitacao`, so the browser can test the real legacy API without exposing the API token in frontend code.
