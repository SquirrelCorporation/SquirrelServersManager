export const getGitUrlWithGitSuffix = (url: string): string => `${url}.git`;
export const getGitUrlWithOutGitSuffix = (url: string): string => url.replace(/\.git$/, '');
