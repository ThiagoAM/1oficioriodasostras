# Testing

Run the visit-counter hydration smoke test with:

```sh
node tests/site-visits-hydration.mjs
```

The test serves the static site locally, stubs the Firebase browser modules, and verifies that both `index.html` and `numeros-cartorio.html` avoid rendering a false `0` before the visit count loads.
