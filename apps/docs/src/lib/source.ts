import { docs } from "collections/server";
import {
  loader,
  type MetaData,
  type PageData,
  type StaticSource,
} from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import type {
  DocData,
  DocMethods,
  MetaMethods,
} from "fumadocs-mdx/runtime/types";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

type DocsPageData = PageData &
  DocData &
  DocMethods & {
    full?: boolean;
  };
type DocsMetaData = MetaData & MetaMethods;

const docsSource = docs.toFumadocsSource() as StaticSource<{
  pageData: DocsPageData;
  metaData: DocsMetaData;
}>;

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docsSource,
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
