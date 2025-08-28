import { all, createStarryNight } from "@wooorm/starry-night";
import { visit, CONTINUE } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";
import { fromHtml } from "hast-util-from-html";

import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";

const starryNight = await createStarryNight(all);

const htmlFiles =
  process.argv.length > 2
    ? globSync(process.argv[2])
    : globSync("public/**/*.html");

for (const file of htmlFiles) {
  console.info(`Visiting ${file}`);
  let counter = [];

  const hastTree = fromHtml(readFileSync(file, "utf8"));
  visit(hastTree, "element", (node, index, parent) => {
    /*
    Structure that we want to find:
    <pre>
      <code class="language-js">console.log("Hello, world!");</code>
    </pre>
    */

    if (node.tagName !== "pre") return CONTINUE;

    const codeElement = node?.children[0];
    if (
      !codeElement ||
      codeElement.type !== "element" ||
      codeElement.tagName !== "code"
    )
      return CONTINUE;

    let language = null;
    const className = codeElement.properties?.className?.[0];
    if (className) {
      const languageMatches = className.match(/^language-(.+)$/);
      if (!languageMatches) {
        console.warn(`Code block has unknown class ${className}`);
        return CONTINUE;
      }
      language = languageMatches[1];
    }

    /*
    Structure that we want to replace with
    <div class="highlight">
      <pre class="chroma" tabindex="0">
        <code class="language-js">
          ...
        </code>
      </pre>
    </div>

    Note that there is javascript that will transform the structure into
    <div class="highlight-wrapper">
      <div class="highlight">
        <button class="copy-button" type="button" aria-label="Copy">Copy</button>
        <pre class="chroma" tabindex="0">
          <code class="language-js">
            ...
          </code>
        </pre>
      </div>
    </div>
    */

    if (!node.properties.className) node.properties.className = [];
    node.properties.className.push("chroma");
    node.properties.tabindex = 0;

    if (language) {
      const languageClass = starryNight.flagToScope(language);
      if (!languageClass) {
        console.warn(`Unknown language: ${language}`);
        counter.push("unknown");
      } else {
        const highlighted = starryNight.highlight(
          codeElement.children[0].value,
          languageClass
        );
        codeElement.children[0] = highlighted;
        counter.push(language);
      }
    } else {
      counter.push("none");
    }

    const wrapperDiv = {
      type: "element",
      tagName: "div",
      properties: {
        className: ["highlight"],
      },
      children: [node],
    };

    parent.children[index] = wrapperDiv;
  });

  if (counter !== 0) {
    writeFileSync(file, toHtml(hastTree));
  }

  console.log(
    `Processed ${file} with ${
      counter.length
    } code block(s) [${counter.toString()}]`
  );
}
