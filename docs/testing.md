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

The customer-service web chat (wbot.chat), which replaced the floating WhatsApp button and the buttons that pointed to WhatsApp, is checked by:

```sh
node tests/wbot-webchat-contract.mjs
```

It guards the script URL, the `token` attribute the vendor script reads from its own tag, the `data-webchat-open` buttons (fallback `#contato` without JavaScript or when the chat fails to load), the absence of `wa.me` buttons in the main pages, the launcher in the bottom-right corner next to the AI button, and the prerender block list. When testing the open chat in a browser, intercept `POST` requests to `app.mzworkspace.com`: opening the chat sends "Iniciar" and starts a real conversation in the registry's service queue.
