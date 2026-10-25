# GitHub Pages handoff — К СЕБЕ v=20

## Source identity

This package was exported from the existing ChatGPT Site source repository, not reconstructed from its public page.

- Site: `k-sebe-pearl-world`
- Saved Site version: `20`
- Source commit: `4d84ce7b0b829f1095ae760c0d0f2126144d65b3`
- Original source tree is preserved. The only additions are this handoff file and `.github/workflows/pages.yml`.
- GitHub Pages serves the existing `dist/` directory as the site root. Its HTML, CSS, JavaScript, fonts and images use relative paths, which work under `/k-sebe-pearl-world/`.

## Publish

1. Create an empty public repository named `k-sebe-pearl-world` under `alyagorokhoff`.
2. Upload and commit the contents of this ZIP to the repository's `main` branch. Keep the top-level `dist/` and `.github/` directories at repository root.
3. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
4. Wait for the **Publish original site to GitHub Pages** workflow to finish. The page will be at `https://alyagorokhoff.github.io/k-sebe-pearl-world/`.

Every push to `main` will publish the current `dist/` directory.

## Scope and static-hosting limits

The published page uses the original static v=20 build. Its layout, text, styles, local assets and browser-side interactions are included. This source contains no server API calls. Purchase buttons currently open the original test dialog stating that working payments are not connected. GitHub Pages cannot provide server-side features such as payment processing, authentication, email delivery, databases or durable multi-user state; none of those are implemented in this v=20 landing page.

## Verification performed

- Confirmed Sites reports latest saved version 20 and its archive contains 17 files.
- Opened the original source checkout and confirmed its HEAD equals the v=20 source commit above.
- Checked that local HTML/CSS/JS/font/image references in `dist/` resolve within the original tree.
- Checked the original JavaScript syntax with Node.
- Checked the Pages workflow and deployment target (`dist/`).

A live GitHub Pages comparison cannot be completed until the new repository is created and Pages finishes its first deployment.
