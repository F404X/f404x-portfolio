# F404X Portfolio

The personal portfolio of **Enzo dos Santos (F404X)**, a Computer Science student who works with real estate registry operations and IT support in Brazil. The site brings together selected projects, my technical background, and ways to get in touch.

## Selected projects

| Project | What it does |
| --- | --- |
| [Windhawk Inspector](https://github.com/luizbizzio/windhawk-inspector) | Reviews Windhawk mod source code in the browser and points to lines that contain potentially sensitive operations. |
| [Lune Bot](https://github.com/luizbizzio/lune-bot) | Automates WhatsApp group administration and provides utilities and mini-games through chat commands. |
| [A404DC](https://github.com/F404X/aidc-generator) | Generates QR codes and barcodes in the browser, with live previews, image exports, and batch generation. |
| [GeoDetective](https://github.com/F404X/geodetective) ([play online](https://f404x.github.io/geodetective/)) | A multilingual geography deduction game with daily and free-play cases, interactive map guesses, adaptive evidence and investigation reports. |

The **About** and **Toolkit** sections cover my background in web development and automation, including JavaScript, React, Node.js, and WebSockets. In **Contact**, you can copy my email address or use the links below.

[LinkedIn](https://www.linkedin.com/in/santosenzo/) · [GitHub](https://github.com/F404X) · [Link hub](https://httpc.f404x.net/)

## Run the site locally

The portfolio is a static site built with HTML, CSS, and JavaScript. Open `index.html` in a browser or, with Python 3 installed, run the following from the repository root.

```sh
python -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The site includes a light and dark theme and an interactive particle background that respects the browser’s reduced motion setting.

## Hosting

GitHub Pages publishes from `main`. The repository workflow updates the CSS and JavaScript version parameters when the assets change. To serve the same files on Cloudflare Pages, use the repository root as the output directory and leave the build command blank. Cloudflare Pages reads the response rules in `_headers`.
