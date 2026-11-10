# F404X Portfolio

Personal portfolio of Enzo dos Santos (F404X), built with plain HTML, CSS, and JavaScript.

## Local preview

Open `index.html` in a browser, or serve this folder with a local static web server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Automatic cache busting (GitHub Pages)

GitHub Pages publishes this repository from `main`. The additional GitHub Actions workflow computes a separate, content-based version for `style.css` and `script.js` when those files change, updates the `?v=...` references in `index.html`, and requests a Pages rebuild. File names stay unchanged; unchanged assets keep their version.

You can also refresh the references locally with `node _build/cache-bust.mjs`. No packages or framework are required. The script is idempotent. The site's normal HTML/CSS/JS can still be previewed directly by opening `index.html`.

GitHub Pages can cache HTML for a short time, so already-open tabs may need a reload to obtain the new references. The `_headers` revalidation rules apply if the project is also hosted on Cloudflare Pages; GitHub Pages does not interpret `_headers`.

## Deploy to Cloudflare Pages

1. In **Workers & Pages**, choose **Create application → Pages → Import an existing Git repository**.
2. Select `F404X/f404x-portfolio` and the production branch `main`.
3. Choose **None** for the framework preset, **`exit 0`** for the build command (or leave it blank), and **`.`** for the build output directory. The site files are in the repository root.
4. Deploy. Cloudflare Pages will publish the site at a `*.pages.dev` address and deploy subsequent pushes to `main` automatically.

For Cloudflare Pages, no additional build process, package installation, or environment variables are required. Cloudflare Pages applies the security and revalidation headers in `_headers` to static responses. GitHub Actions maintains the cache fingerprints in the source so both hosts can serve the updated links.

## Customizing

- Edit `index.html` for the biography, project cards, and contact links.
- Edit `style.css` for layout, colors, and typography.
- Edit `script.js` for theme switching and email copying.

The page uses Google Fonts. If you prefer no third-party font requests, remove the font stylesheet in `index.html`; the CSS includes system-font fallbacks.
