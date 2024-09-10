import { all, createStarryNight } from "@wooorm/starry-night";
import { visit, CONTINUE } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";
import { fromHtml } from "hast-util-from-html";

import { readFileSync, writeFileSync } from "fs";
import { inspect } from "util";
import { globSync } from "glob";

const starryNight = await createStarryNight(all);
const prefix = "language-";
const htmlFiles = globSync("public/**/*.html");

for (const file of htmlFiles) {
  console.log(`Starting ${file}`);
  let counter = 0;

  const hastTree = fromHtml(readFileSync(file, "utf8"));
  visit(hastTree, 'element', (node) => {
    if (node.tagName !== 'code') return CONTINUE;

    const classNames = node.properties.className;
    if (!classNames) return CONTINUE;

    const className = classNames.find((name) => name.startsWith(prefix));
    if (!className) {
      console.warn("Code block has no language class???", node);
      return CONTINUE;
    }

    if (node.children.length !== 1) {
      console.warn("Code block has multiple children???", node);
      return CONTINUE;
    }

    const codeContent = node.children[0].value;
    if (!codeContent) {
      console.warn("Code block has no content???", node);
      return CONTINUE;
    }
    
    const languageClass = starryNight.flagToScope(className.slice(prefix.length));
    if (!languageClass) {
      console.warn("Unknown scope", className);
      return CONTINUE;
    }
    
    const highlighted = starryNight.highlight(codeContent, languageClass);

    node.children[0] = highlighted;

    counter++;
  });

  if (counter !== 0) {
    writeFileSync(file, toHtml(hastTree));
  }

  console.log(`Processed ${file} with ${counter} code blocks`);
}
