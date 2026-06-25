const { execSync } = require("child_process");

const branch =
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_REF_NAME ||
  "";

console.log("Building branch:", branch || "local/unknown");

if (branch === "develop") {
  execSync("npm run build:dev", { stdio: "inherit" });
} else {
  execSync("npm run build:prod", { stdio: "inherit" });
}