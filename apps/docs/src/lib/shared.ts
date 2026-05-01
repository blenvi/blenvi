export const appName = "Blenvi";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

const [githubUser = "", githubRepo = ""] = (
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? ""
)
  .split("/")
  .map((segment) => segment.trim());

export const gitConfig = {
  user: githubUser,
  repo: githubRepo,
  branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main",
};
