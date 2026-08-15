export default async function initMonorepo() {
  // Initialize Turborepo workspace
  await cloned.mozart.init();

  // Configure TypeScript
  await cloned.typescript.init();

  // Setup ESLint
  await cloned.eslint.init();

  // Add pre-commit hook
  await cloned.githubActions.createCheck();
}