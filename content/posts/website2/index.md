---
title: Updating this website
date: 2025-08-28
summary: Dealing with upgrade errors
tags: ["website"]
---

{{< mathjax >}}

When I tried adding a new post yesterday, Github actions choked with the following error.

```
ERROR deprecated: site config key paginate was deprecated in Hugo v0.128.0 and subsequently removed. Use pagination.pagerSize instead.
WARN  Module "blowfish" is not compatible with this Hugo version: 0.87.0/0.134.0; run "hugo mod graph" for more information.
Start building sites … 
hugo v0.148.2-40c3d8233d4b123eff74725e5766fc6272f0a84d+extended linux/amd64 BuildDate=2025-07-27T12:43:24Z VendorInfo=gohugoio

Total in 132 ms
Error: error building site: html/template:_shortcodes/figure.html:3:14: no such template "_internal/shortcodes/figure.html"
Error: Process completed with exit code 1.
```

I tried a lazy solution which was to pin the last working version but for some reason the the new post was *still* not appearing even though the deployment was successful.

```diff
diff --git a/.github/workflows/hugo.yaml b/.github/workflows/hugo.yaml
index 3b60232..a486705 100644
--- a/.github/workflows/hugo.yaml
+++ b/.github/workflows/hugo.yaml
@@ -36,7 +36,7 @@ jobs:
       - name: Setup Hugo
         uses: peaceiris/actions-hugo@v3
         with:
-          hugo-version: 'latest'
+          hugo-version: '0.134.1'
           extended: true
```

So that meant I had to test locally which meant I needed to upgrade everything first. 

One of the tasks was to update my fork of Blowfish. It turns out that if a fork on Github is behind the upstream but also ahead, then Github offers you this handy button to discard your own changes and just pull all the newer changes from upstream. However, the process will leave behind your own changes as *orphaned* commits. I only have the link to one of them since I referenced it in the original post, but the others are lost. I suspect Github may have ran the Git garbage collection command. In hindsight, I should have created a branch first since it was just a few extra clicks.

I also claned up the `vendor.html` file so it only adds lines. This should make resolving merge conflicts easier in the future. This also required adding a new shortcode file `mathjax.html` as well. There is nothing in the file.

```diff
diff --git a/layouts/partials/vendor.html b/layouts/partials/vendor.html
index 9210cc57..74249b05 100644
--- a/layouts/partials/vendor.html
+++ b/layouts/partials/vendor.html
@@ -52,6 +52,13 @@
   {{ end }}
 {{ end }}
 
+{{/* MathJax */}}
+{{ if .Page.HasShortcode "mathjax" }}
+{{ $jsMathjax := resources.Get "js/mathjax-render.js" }}
+{{ $jsMathjax := $jsMathjax | resources.ExecuteAsTemplate "js/mathjax-render.js" . | resources.Minify | resources.Fingerprint "sha512" }}
+<script type="text/javascript" src="{{ $jsMathjax.RelPermalink }}" integrity="{{ $jsMathjax.Data.Integrity }}" async></script>
+{{ end }}
+
 {{/* TypeIt */}}
 {{ if .Page.HasShortcode "typeit" }}
   {{ $typeitLib := resources.Get "lib/typeit/typeit.umd.js" | resources.Fingerprint (.Site.Params.fingerprintAlgorithm | default "sha512") }}
```

That's basically it for all the new changes in the theme. The existing changes to the CSS haven't changed from my last time editing the theme. See [here](/posts/website/index.html) for the old post.

As for the website, most of the changes happened in the `generate_starry_night.js` script. I modified the script so that it would allow the `copy` button to appear in the top right corner. It turns out that I only needed to add a skeleton structure because there is JavaScript that will dynamically add the button after the website loads. I had to inspect three different states of the website
- Using the original Goldberg renderer
- Using the original Goldberg renderer but with JavaScript disabled
- Disabling the Goldberg renderer

There was also a minor issue with the 404 page. The path to the interesting xkcd was missing a `/` in front so it was being treated as a relative path instead of an absolute one.

Finally, there was the issue with the math equations. For the display equations that are wider than the page, the web browser will render a horizontal scroll bar which cuts into the bottom of the equation. This only happens if the user mouses over the equation but it is still a pretty annoying artifact. So I had to add padding on the bottom. However, this also affected inline equations which made them super tall. That's why I had to add a second rule with a specifier to make sure the padding was only added to display equations.

```diff
diff --git a/assets/css/main.css b/assets/css/main.css
index 023eef06..9e137935 100644
--- a/assets/css/main.css
+++ b/assets/css/main.css
@@ -134,6 +136,19 @@ button,
   width: calc(100% - 2px);
 }
 
+/* Fix long Mathjax equations (see https://meta.stackexchange.com/q/325870) */
+mjx-container {
+  overflow-x: auto;
+  overflow-y: hidden;
+  max-width: 100%;
+  display: inline-block;
+}
+
+mjx-container[display="true"] {
+  padding-bottom: 1rem;
+  scrollbar-gutter: stable;
+}
+
 /* Fix long tables breaking out of article on mobile */
 table {
   display: block;
```

## Overall diff

```diff
diff --git a/assets/css/compiled/main.css b/assets/css/compiled/main.css
index 2a0aab1c2..e7876f23c 100644
--- a/assets/css/compiled/main.css
+++ b/assets/css/compiled/main.css
... (can be recompiled)
diff --git a/assets/css/main.css b/assets/css/main.css
index 023eef063..9e1379359 100644
--- a/assets/css/main.css
+++ b/assets/css/main.css
@@ -4,6 +4,8 @@
 @import "./components/chroma.css";
 @import "./components/a11y.css";
 
+@import "./schemes/starry-night-both.css";
+
 @import "tailwindcss";
 @config "../../tailwind.config.js";
 
@@ -134,6 +136,19 @@ button,
   width: calc(100% - 2px);
 }
 
+/* Fix long Mathjax equations (see https://meta.stackexchange.com/q/325870) */
+mjx-container {
+  overflow-x: auto;
+  overflow-y: hidden;
+  max-width: 100%;
+  display: inline-block;
+}
+
+mjx-container[display="true"] {
+  padding-bottom: 1rem;
+  scrollbar-gutter: stable;
+}
+
 /* Fix long tables breaking out of article on mobile */
 table {
   display: block;
diff --git a/assets/css/schemes/starry-night-both.css b/assets/css/schemes/starry-night-both.css
new file mode 100644
index 000000000..0ed740bdf
--- /dev/null
+++ b/assets/css/schemes/starry-night-both.css
@@ -0,0 +1,188 @@
+/* This is a theme distributed by `starry-night`.
+ * It’s based on what GitHub uses on their site.
+ * See <https://github.com/wooorm/starry-night> for more info. */
+:root {
+  --color-prettylights-syntax-brackethighlighter-angle: #59636e;
+  --color-prettylights-syntax-brackethighlighter-unmatched: #82071e;
+  --color-prettylights-syntax-carriage-return-bg: #cf222e;
+  --color-prettylights-syntax-carriage-return-text: #f6f8fa;
+  --color-prettylights-syntax-comment: #59636e;
+  --color-prettylights-syntax-constant: #0550ae;
+  --color-prettylights-syntax-constant-other-reference-link: #0a3069;
+  --color-prettylights-syntax-entity: #6639ba;
+  --color-prettylights-syntax-entity-tag: #0550ae;
+  --color-prettylights-syntax-invalid-illegal-bg: #82071e;
+  --color-prettylights-syntax-invalid-illegal-text: #f6f8fa;
+  --color-prettylights-syntax-keyword: #cf222e;
+  --color-prettylights-syntax-markup-changed-bg: #ffd8b5;
+  --color-prettylights-syntax-markup-changed-text: #953800;
+  --color-prettylights-syntax-markup-deleted-bg: #ffebe9;
+  --color-prettylights-syntax-markup-deleted-text: #82071e;
+  --color-prettylights-syntax-markup-heading: #0550ae;
+  --color-prettylights-syntax-markup-ignored-bg: #0550ae;
+  --color-prettylights-syntax-markup-ignored-text: #d1d9e0;
+  --color-prettylights-syntax-markup-inserted-bg: #dafbe1;
+  --color-prettylights-syntax-markup-inserted-text: #116329;
+  --color-prettylights-syntax-markup-list: #3b2300;
+  --color-prettylights-syntax-meta-diff-range: #8250df;
+  --color-prettylights-syntax-string: #0a3069;
+  --color-prettylights-syntax-string-regexp: #116329;
+  --color-prettylights-syntax-sublimelinter-gutter-mark: #818b98;
+  --color-prettylights-syntax-variable: #953800;
+  --color-prettylights-syntax-markup-bold: #1f2328;
+  --color-prettylights-syntax-markup-italic: #1f2328;
+  --color-prettylights-syntax-storage-modifier-import: #1f2328;
+}
+
+:root.dark {
+  --color-prettylights-syntax-brackethighlighter-angle: #9198a1;
+  --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
+  --color-prettylights-syntax-carriage-return-bg: #b62324;
+  --color-prettylights-syntax-carriage-return-text: #f0f6fc;
+  --color-prettylights-syntax-comment: #9198a1;
+  --color-prettylights-syntax-constant: #79c0ff;
+  --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
+  --color-prettylights-syntax-entity: #d2a8ff;
+  --color-prettylights-syntax-entity-tag: #7ee787;
+  --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
+  --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
+  --color-prettylights-syntax-keyword: #ff7b72;
+  --color-prettylights-syntax-markup-bold: #f0f6fc;
+  --color-prettylights-syntax-markup-changed-bg: #5a1e02;
+  --color-prettylights-syntax-markup-changed-text: #ffdfb6;
+  --color-prettylights-syntax-markup-deleted-bg: #67060c;
+  --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
+  --color-prettylights-syntax-markup-heading: #1f6feb;
+  --color-prettylights-syntax-markup-ignored-bg: #1158c7;
+  --color-prettylights-syntax-markup-ignored-text: #f0f6fc;
+  --color-prettylights-syntax-markup-inserted-bg: #033a16;
+  --color-prettylights-syntax-markup-inserted-text: #aff5b4;
+  --color-prettylights-syntax-markup-italic: #f0f6fc;
+  --color-prettylights-syntax-markup-list: #f2cc60;
+  --color-prettylights-syntax-meta-diff-range: #d2a8ff;
+  --color-prettylights-syntax-storage-modifier-import: #f0f6fc;
+  --color-prettylights-syntax-string: #a5d6ff;
+  --color-prettylights-syntax-string-regexp: #7ee787;
+  --color-prettylights-syntax-sublimelinter-gutter-mark: #3d444d;
+  --color-prettylights-syntax-variable: #ffa657;
+}
+
+.pl-c {
+  color: var(--color-prettylights-syntax-comment);
+}
+
+.pl-c1,
+.pl-s .pl-v {
+  color: var(--color-prettylights-syntax-constant);
+}
+
+.pl-e,
+.pl-en {
+  color: var(--color-prettylights-syntax-entity);
+}
+
+.pl-smi,
+.pl-s .pl-s1 {
+  color: var(--color-prettylights-syntax-storage-modifier-import);
+}
+
+.pl-ent {
+  color: var(--color-prettylights-syntax-entity-tag);
+}
+
+.pl-k {
+  color: var(--color-prettylights-syntax-keyword);
+}
+
+.pl-s,
+.pl-pds,
+.pl-s .pl-pse .pl-s1,
+.pl-sr,
+.pl-sr .pl-cce,
+.pl-sr .pl-sre,
+.pl-sr .pl-sra {
+  color: var(--color-prettylights-syntax-string);
+}
+
+.pl-v,
+.pl-smw {
+  color: var(--color-prettylights-syntax-variable);
+}
+
+.pl-bu {
+  color: var(--color-prettylights-syntax-brackethighlighter-unmatched);
+}
+
+.pl-ii {
+  color: var(--color-prettylights-syntax-invalid-illegal-text);
+  background-color: var(--color-prettylights-syntax-invalid-illegal-bg);
+}
+
+.pl-c2 {
+  color: var(--color-prettylights-syntax-carriage-return-text);
+  background-color: var(--color-prettylights-syntax-carriage-return-bg);
+}
+
+.pl-sr .pl-cce {
+  font-weight: bold;
+  color: var(--color-prettylights-syntax-string-regexp);
+}
+
+.pl-ml {
+  color: var(--color-prettylights-syntax-markup-list);
+}
+
+.pl-mh,
+.pl-mh .pl-en,
+.pl-ms {
+  font-weight: bold;
+  color: var(--color-prettylights-syntax-markup-heading);
+}
+
+.pl-mi {
+  font-style: italic;
+  color: var(--color-prettylights-syntax-markup-italic);
+}
+
+.pl-mb {
+  font-weight: bold;
+  color: var(--color-prettylights-syntax-markup-bold);
+}
+
+.pl-md {
+  color: var(--color-prettylights-syntax-markup-deleted-text);
+  background-color: var(--color-prettylights-syntax-markup-deleted-bg);
+}
+
+.pl-mi1 {
+  color: var(--color-prettylights-syntax-markup-inserted-text);
+  background-color: var(--color-prettylights-syntax-markup-inserted-bg);
+}
+
+.pl-mc {
+  color: var(--color-prettylights-syntax-markup-changed-text);
+  background-color: var(--color-prettylights-syntax-markup-changed-bg);
+}
+
+.pl-mi2 {
+  color: var(--color-prettylights-syntax-markup-ignored-text);
+  background-color: var(--color-prettylights-syntax-markup-ignored-bg);
+}
+
+.pl-mdr {
+  font-weight: bold;
+  color: var(--color-prettylights-syntax-meta-diff-range);
+}
+
+.pl-ba {
+  color: var(--color-prettylights-syntax-brackethighlighter-angle);
+}
+
+.pl-sg {
+  color: var(--color-prettylights-syntax-sublimelinter-gutter-mark);
+}
+
+.pl-corl {
+  text-decoration: underline;
+  color: var(--color-prettylights-syntax-constant-other-reference-link);
+}
diff --git a/assets/js/mathjax-render.js b/assets/js/mathjax-render.js
new file mode 100644
index 000000000..67838c8b0
--- /dev/null
+++ b/assets/js/mathjax-render.js
@@ -0,0 +1,34 @@
+window.MathJax = {
+  tex: {
+    /* start/end delimiter pairs for in-line math */
+    inlineMath: [
+      ["$", "$"],
+      ["\\(", "\\)"],
+    ],
+    /* start/end delimiter pairs for display math */
+    displayMath: [
+      ["$$", "$$"],
+      ["\\[", "\\]"],
+    ],
+    options: {
+      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
+    }
+  },
+  svg: {
+    fontCache: "global",
+  },
+  startup: {
+    ready: () => {
+      console.log("MathJax is loaded, but not yet initialized");
+      MathJax.startup.defaultReady();
+      console.log("MathJax is initialized, and the initial typeset is queued");
+    },
+  },
+};
+
+(function () {
+  var script = document.createElement("script");
+  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
+  script.async = true;
+  document.head.appendChild(script);
+})();
diff --git a/layouts/partials/vendor.html b/layouts/partials/vendor.html
index 9210cc573..74249b056 100644
--- a/layouts/partials/vendor.html
+++ b/layouts/partials/vendor.html
@@ -52,6 +52,13 @@
   {{ end }}
 {{ end }}
 
+{{/* MathJax */}}
+{{ if .Page.HasShortcode "mathjax" }}
+{{ $jsMathjax := resources.Get "js/mathjax-render.js" }}
+{{ $jsMathjax := $jsMathjax | resources.ExecuteAsTemplate "js/mathjax-render.js" . | resources.Minify | resources.Fingerprint "sha512" }}
+<script type="text/javascript" src="{{ $jsMathjax.RelPermalink }}" integrity="{{ $jsMathjax.Data.Integrity }}" async></script>
+{{ end }}
+
 {{/* TypeIt */}}
 {{ if .Page.HasShortcode "typeit" }}
   {{ $typeitLib := resources.Get "lib/typeit/typeit.umd.js" | resources.Fingerprint (.Site.Params.fingerprintAlgorithm | default "sha512") }}
diff --git a/layouts/shortcodes/mathjax.html b/layouts/shortcodes/mathjax.html
new file mode 100644
index 000000000..a4160bfbd
--- /dev/null
+++ b/layouts/shortcodes/mathjax.html
@@ -0,0 +1 @@
+{{/* Nothing to see here */}}
diff --git a/tailwind.config.js b/tailwind.config.js
index 5a5d434f6..28ba5e951 100644
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
@@ -86,23 +86,22 @@ module.exports = {
             "--tw-prose-invert-quotes": theme("colors.neutral.200 / 1"),
             "--tw-prose-invert-quote-borders": theme("colors.primary.900 / 1"),
             "--tw-prose-invert-captions": theme("colors.neutral.400 / 1"),
-            "--tw-prose-invert-code": theme("colors.secondary.400 / 1"),
+            "--tw-prose-invert-code": theme("colors.neutral.200 / 1"),
             "--tw-prose-invert-pre-code": theme("colors.neutral.200 / 1"),
             "--tw-prose-invert-pre-bg": theme("colors.neutral.700 / 1"),
             "--tw-prose-invert-th-borders": theme("colors.neutral.500 / 1"),
             "--tw-prose-invert-td-borders": theme("colors.neutral.700 / 1"),
             a: {
               textDecoration: "none",
-              textDecorationColor: theme("colors.primary.300 / 1"),
+              textDecorationColor: "var(--tw-prose-links)",
               fontWeight: "500",
               "&:hover": {
-                color: theme("colors.primary.600 / 1"),
-                textDecoration: "none",
-                borderRadius: "0.09rem",
+                color: "var(--tw-prose-links)",
+                textDecoration: "underline",
               },
             },
             "a code": {
-              color: "var(--tw-prose-code)",
+              color: "var(--tw-prose-links)",
             },
             kbd: {
               backgroundColor: theme("colors.neutral.200 / 1"),
@@ -148,9 +147,9 @@ module.exports = {
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
