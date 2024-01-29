export function getCrowdinBranchName(gitBranchName: string) {
  // Replace all slashes with dashes
  return gitBranchName.replace(/\//g, "-");
}
