# Publishing the LabourCode Pro Web repository

This file is for the repository owner. The public README is written for app users.

## 1. Create the GitHub repository

Create a repository, for example `LabourCodePro-Web`, under your GitHub account. Choose **Public** if you want general access to the website. Upload **all the contents** of this package, preserving the `.github/workflows/` directory, `site/`, `screenshots/`, `tests/`, `tools/`, and root files. Avoid placing the entire project inside a second nested folder in the repository.

Alternatively, from a terminal opened in the extracted project folder:

```bash
git init
git add .
git commit -m "Initial LabourCode Pro Web 1.0 release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPOSITORY` with your actual values. The package contains no `.git` history or authentication tokens.

## 2. Enable GitHub Pages

In the repository open **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow at `.github/workflows/deploy-pages.yml` verifies the full Acts and publishes **only** the `site/` folder when you push to `main`. Check **Actions** for build/deployment results. An eventual site URL normally follows `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` (not active until deployment succeeds).

GitHub Pages availability and privacy settings depend on repository/account policies. Ensure Pages is enabled and GitHub Actions can deploy to the `github-pages` environment.

## 3. Verify after publishing

- Open the website on desktop and phone, check top Search/Theme controls and bottom navigation.
- Open all four original PDFs and inspect the first and last pages.
- Test searches such as `wages`, `fixed term employment`, `gratuity`, `section 2`.
- Run a quiz and refresh the page to check private progress storage.
- Wait for offline assets to cache, then test the installed app in airplane/offline mode.
- Check your repository Actions for green `Verify complete embedded Acts and site resources` and `Publish website` steps.

## 4. Versions and updates

- Web app version: `1.0.0`. Learning content was carried forward from the premium Android 1.1.0 source edition.
- If you change a script, legal document or asset, increment `CACHE_NAME` in `site/sw.js` to trigger a fresh offline cache.
- Preserve the original Gazette PDFs byte-for-byte and verify their checksums using `npm test`.
- Do not commit API keys, personal employment records or internal organisational documents.

## Repository details (suggested)

**Description:** A premium offline-first Indian Labour Codes learning platform with four complete Acts, interactive explanations, legal search, quizzes, infographics and HR tools.

**Topics:** `indian-labour-law`, `labour-codes`, `legal-education`, `pwa`, `progressive-web-app`, `javascript`, `offline-first`, `hr-compliance`, `employment-law`, `legal-tech`

**Website:** Add the deployed Pages URL to the repository's **About** section after the first successful deployment.

## Licensing

No open-source redistribution license has been applied automatically. Select a suitable license before authorising third-party copying, modification or distribution. The original statutory Gazette texts should remain appropriately attributed to their source.
