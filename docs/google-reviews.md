# Google review count

The owner requested a weekly refresh on 2026-09-15: Fridays at 08:00 in
America/Sao_Paulo, using GPT-5.6 Sol with medium reasoning in the local
"Site Cartório" project. The schedule is managed in Codex. Its prompt and
configuration record live in the Mac mini administration repository.

## Source and scope

- Open the public [Google Maps listing](https://maps.app.goo.gl/VQS7zjTKEZ4Dpodv5)
  using the available browser tool and read the exact total beside the rating.
- Confirm the listing is "Cartório 1° Ofício de Justiça de Rio das Ostras/RJ -
  Notas, RCPN e Protesto", at R. Luiza Viana, 87, Centro, Rio das Ostras, with
  website `cartorioderiodasostras.com.br`. The Maps feature ID is
  `0x97b30020fba24b:0x220ae06be19b9dec`.
- Use the establishment's total, not the counts for a reviewer, rating band,
  search result, or "more reviews" button. An abbreviated number is insufficient.
- Update only `window.SiteData.philosophy.reviews.totalLabel` in
  `assets/js/site-data.js`, formatted as `1.277 avaliações no Google`.
  Keep the rating and selected testimonials unchanged.
- If the exact number cannot be confirmed, preserve the current label and
  report the failed check. If unchanged, finish without edits or an empty commit.

## Publish a changed count

The request authorizes committing and pushing this count update to `origin/main`
in this repository. GitHub Pages publishes the root of `main` to
<https://cartorioderiodasostras.com.br/>. This authorization covers the count and
its generated HTML only, not unrelated site changes or Firebase deployment.

1. Read applicable repository instructions and inspect Git status. Fetch
   `origin/main`; use a clean, synchronized `main`. If the checkout has other
   work, use a temporary worktree from `origin/main`, preserving that work.
2. Change the source label. Install locked dependencies with `npm ci` if needed.
   Ensure the browser is installed with `npx --no-install playwright install
   chromium --only-shell` before running the prerenderer or browser tests.
   Run `npm run prerender -- index.html`; it generates the static/no-JavaScript home from the
   same data. Set `PRERENDER_PORT` to a free port if the default is occupied.
   The page argument avoids regenerating unrelated pages and their visit counts.
3. Verify the source label equals `.reviews-count` in `index.html`. Run `npm test`
   and `git diff --check`. Review all generated diffs: the publication must
   contain only the count change in `assets/js/site-data.js` and `index.html`.
   Do not publish unrelated generated changes or alter tests to make them pass.
4. Stage those two paths explicitly, review the staged diff, commit, and push
   to `origin/main` without force. A push rejection requires fetching and
   reassessing the latest count and changes before retrying.
5. Confirm the remote contains the commit. Check the GitHub Pages build and
   the public home and `assets/js/site-data.js` for the new label. A successful
   push with a pending build is a pending deployment, not confirmed publication.

Keep per-run evidence (time, source URL, old/new counts, validation results,
commit, and deployment state) outside the site repository. Re-running this
procedure with the same Google count must not create another commit.
