---
title: Making this website
date: 2024-09-09
draft: false
summary: How this website was made
tags: ["website"]
heroStyle: "background"
---

My old website was made with [MoonWalker](https://github.com/abhinavs/moonwalk) and it was simplistic enough except there was one major issue. This is probably a skill issue on my behalf but the project and template were super old and I couldn't get the dependency requirements to line up no matter what on my local machine. This frustration led me to experiment with [Hugo](https://gohugo.io/) which seemed to do the same thing as [Jekyll](https://jekyllrb.com/) but there were much better templates available. I'm mostly a backend person so that was a pretty great deal.

I eventually found the Blowfish theme which is wonderfully configurable (although too much so at times). However, there were still some things to be addressed.

1. Blowfish only supports [katex](https://katex.org/) but I want to be able to use [MathJax](https://www.mathjax.org/) which is superior.
2. I want better code highlighting such as that provided by [starry-night](https://github.com/wooorm/starry-night)
3. Improve how links are displayed
4. How to deploy this with Github Pages; Jekyll just worked:tm: but Hugo isn't like that

## Adding Mathjax Support

I made my own fork of the Blowfish repository and added `assets/js/load-mathjax.js` to load Mathjax. I also needed to modify `assets/css/main.css`, `layouts/partials/vendor.html` and `config/_default/hugo.toml`. See [`#8bd5a90`](https://github.com/someretical/blowfish/commit/8bd5a90031cde824ead852f8115e755738961b22) for more details. We also need to add

```toml
[markup]
    [markup.goldmark]
        [markup.goldmark.renderer]
            unsafe = true
        [markup.goldmark.extensions.passthrough]
            enable = true
            delimiters.block = [["\\[", "\\]"], ["$$", "$$"]]
            # using $ as the inline-delimiter (optional, maybe)
            delimiters.inline = [["\\(", "\\)"], ["$", "$"]]
```

to our `hugo.toml` file; courtesy of [this Github comment](https://github.com/nunocoracao/blowfish/issues/551#issuecomment-2134367524). Putting this in the Blowfish theme repository doesn't have any effect unfortunately. 

Now it is possible to render inline equations like \( E=mc^2 \) and much longer equations like the family of solutions for the hydrogen atom :yum:

\[
\psi_{n\ell m}(r,\theta ,\varphi )={\sqrt {\left({\frac {2}{na_{0}}}\right)^{3}{\frac {(n-\ell -1)!}{2n[(n+\ell )!]}}}}e^{-r/na_{0}}\left({\frac {2r}{na_{0}}}\right)^{\ell }L_{n-\ell -1}^{2\ell +1}\left({\frac {2r}{na_{0}}}\right)\cdot Y_{\ell }^{m}(\theta ,\varphi )
\]

There are a few things to watch out for though. Visual Studio Code might be annoying and convert all `_`'s into `*`'s so beware of that mucking up your equations.

As a last note, there is some fuckery going on with the CSS that I do not fully understand. One of the inline stylesheets provided by Mathjax sets `mjx-container[jax="SVG"][display="true"]` to have `display: block` property which makes the display blocks take up the whole line by themselves. However, setting `display: inline-block` inside of `assets/css/main.css` for all `mjx-container` still works because the inline stylesheet overrides that or something? Doing this makes inline math blocks actually display inline and display blocks take up an entire line. I don't fully understand but it works so I am not going to touch it. I am just glad everything works:tm:.

## Adding Better Code Highlighting

Hugo uses [Goldmark](https://github.com/yuin/goldmark/) to render markdown to HTML. If we want to change how code is highlighted, we will need to extend the project somehow. The way we want to render our code blocks is with starry-night. However, the problem is that Goldmark is written in Go while starry-night is written in TypeScript; these are very different languages.

We can sidestep this whole mess with some more fuckery. If we add

```toml
  [markup.highlight]
    codeFences = false
```

after what we had before in our `hugo.toml`, then this stops Goldmark from highlighting our display code blocks (inline ones are another matter). The important thing is that if we look at the HTML generated, Goldmark has turned

```js
import {
  common,
  createStarryNight,
} from "https://esm.sh/@wooorm/starry-night@3?bundle";
import { toDom } from "https://esm.sh/hast-util-to-dom@4?bundle";

const starryNight = await createStarryNight(common);
const prefix = "language-";

const nodes = Array.from(document.body.querySelectorAll("code"));

for (const node of nodes) {
  const className = Array.from(node.classList).find(function (d) {
    return d.startsWith(prefix);
  });
  if (!className) continue;
  const scope = starryNight.flagToScope(className.slice(prefix.length));
  if (!scope) continue;
  const tree = starryNight.highlight(node.textContent, scope);
  node.replaceChildren(toDom(tree, { fragment: true }));
}
```

into

```html
<code class="language-js">import {
  common,
  createStarryNight,
} from "https://esm.sh/@wooorm/starry-night@3?bundle";
import { toDom } from "https://esm.sh/hast-util-to-dom@4?bundle";

const starryNight = await createStarryNight(common);
const prefix = "language-";

const nodes = Array.from(document.body.querySelectorAll("code"));

for (const node of nodes) {
  const className = Array.from(node.classList).find(function (d) {
    return d.startsWith(prefix);
  });
  if (!className) continue;
  const scope = starryNight.flagToScope(className.slice(prefix.length));
  if (!scope) continue;
  const tree = starryNight.highlight(node.textContent, scope);
  node.replaceChildren(toDom(tree, { fragment: true }));
}
</code>
```

for us. This is incredibly useful because we can now run a script which turns our `<code>` elements into properly highlighted ones. We can then use the provided CSS file with starry-night to apply the colouring. However, we need to replace the `@media (prefers-color-scheme: dark)` with `:root.dark` as Blowfish toggles if `dark` is part of the root node's class list. The `starry-night-both.css` file goes inside our Blowfish fork at `assets/css/components/starry-night-both.css`. To load it properly, we need to add `@import "components/starry-night-both.css"` to the top of 
`assets/css/main.css`. 

To rebuild with all our changes, we can just run `cd themes/blowfish && npm install && npm run build` (`npm install` not needed on subsequent invokations). We don't want to run `./themes/blowfish/node_modules/tailwindcss/lib/cli.js -c ./themes/blowfish/tailwind.config.js -i ./themes/blowfish/assets/css/main.css -o ./assets/css/compiled/main.css --jit` as per the [Blowfish docs](https://blowfish.page/docs/advanced-customisation/) as that places the newly generated CSS file in the website repository (we only want it in our Blowfish fork).

Our custom script `generate_starry_night.js` for invoking starry-night has to go in the actual website repository. This script is not that bad but took me absolutely ages to write because there wasn't any good example code for it; both ChatGPT and Copilot choked multiple times. This system is messy but it works which is what I ultimately need.

What this solution breaks is the "copy" button normally located at the top right corner of code blocks. This is an unfortunate side effect of disabling code block parsing. A more advanced script could in theory find the inadequately formatted code blocks and strip all the `<span>`'s from them and then pass that back into starry-night to get the better formatted output. However, that is a project for another day.

## Improving Links

The default Blowfish theme doesn't underline links when they are hovered over. It also doesn't highlight links if they are inside of code blocks. However, Github supports this and this also happens to be a feature I personally like. A related change I also want is to make inline code blocks have the same colour as the surrounding text. The following diff shows the changes I made to the forked theme repository.

```diff
--- a/tailwind.config.js
+++ b/tailwind.config.js
@@ -70,7 +70,7 @@ module.exports = {
             "--tw-prose-quotes": theme("colors.neutral.700 / 1"),
             "--tw-prose-quote-borders": theme("colors.primary.200 / 1"),
             "--tw-prose-captions": theme("colors.neutral.500 / 1"),
-            "--tw-prose-code": theme("colors.secondary.700 / 1"),
+            "--tw-prose-code": theme("colors.neutral.700 / 1"),
             "--tw-prose-pre-code": theme("colors.neutral.700 / 1"),
             "--tw-prose-pre-bg": theme("colors.neutral.50 / 1"),
             "--tw-prose-th-borders": theme("colors.neutral.500 / 1"),
@@ -86,23 +86,23 @@ module.exports = {
             "--tw-prose-invert-quotes": theme("colors.neutral.200 / 1"),
             "--tw-prose-invert-quote-borders": theme("colors.primary.900 / 1"),
             "--tw-prose-invert-captions": theme("colors.neutral.400 / 1"),
-            "--tw-prose-invert-code": theme("colors.secondary.400 / 1"),
+            "--tw-prose-invert-code": theme("colors.neutral.300 / 1"),
             "--tw-prose-invert-pre-code": theme("colors.neutral.200 / 1"),
             "--tw-prose-invert-pre-bg": theme("colors.neutral.700 / 1"),
             "--tw-prose-invert-th-borders": theme("colors.neutral.500 / 1"),
             "--tw-prose-invert-td-borders": theme("colors.neutral.700 / 1"),
             a: {
               textDecoration: "none",
-              textDecorationColor: theme("colors.primary.300 / 1"),
+              color: "var(--tw-prose-links)",
               fontWeight: "500",
               "&:hover": {
-                color: theme("colors.primary.600 / 1"),
-                textDecoration: "none",
-                borderRadius: "0.09rem",
+                color: "var(--tw-prose-links)",
+                textDecoration: "underline",
+                // borderRadius: "0.09rem",
               },
             },
             "a code": {
-              color: "var(--tw-prose-code)",
+              color: "var(--tw-prose-links)",
             },
             kbd: {
               backgroundColor: theme("colors.neutral.200 / 1"),
@@ -148,9 +148,9 @@ module.exports = {
         invert: {
           css: {
             a: {
-              textDecorationColor: theme("colors.neutral.600 / 1"),
+              textDecorationColor: "var(--tw-prose-invert-links)",
               "&:hover": {
-                color: theme("colors.primary.400 / 1"),
+                color: "var(--tw-prose-invert-links)",
               },
             },
             kbd: {
```

Now everything looks much better.

## Deploying to Github Pages

This was the easiest part of the whole experience. The hardest part was getting the 404 page to load properly but that only required all assets it referenced to be placed in the static folder.

## Conclusion

The whole process took about 3 days but I am really happy with the result. The new website looks and feels much nicer at the cost of slightly worse SEO performance.
