# F404X Portfolio

Personal portfolio of Enzo dos Santos (F404X), built with plain HTML, CSS, and JavaScript.

## Local preview

Open `index.html` in a browser, or serve this folder with a local static web server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to Cloudflare Pages

1. In **Workers & Pages**, choose **Create application → Pages → Import an existing Git repository**.
2. Select `F404X/f404x-portfolio` and the production branch `main`.
3. Choose **None** for the framework preset, **`exit 0`** for the build command (or leave it blank), and **`.`** for the build output directory. The site files are in the repository root.
4. Deploy. Cloudflare Pages will publish the site at a `*.pages.dev` address and deploy subsequent pushes to `main` automatically.

No build process, package installation, or environment variables are required. Cloudflare Pages applies the security headers in `_headers` to static assets.

## Customizing

- Edit `index.html` for the biography, project cards, and contact links.
- Edit `style.css` for layout, colors, and typography.
- Edit `script.js` for theme switching and email copying.

The page uses Google Fonts. If you prefer no third-party font requests, remove the font stylesheet in `index.html`; the CSS includes system-font fallbacks.
