import { bundledLanguages } from './langs.mjs';
export { bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo } from './langs.mjs';
import { g as getWasmInlined } from './chunks/wasm-dynamic.mjs';
import { bundledThemes } from './themes.mjs';
export { bundledThemesInfo } from './themes.mjs';
import { createdBundledHighlighter, createSingletonShorthands } from '@shikijs/core';
export * from '@shikijs/core';

const getHighlighter = /* @__PURE__ */ createdBundledHighlighter(
  bundledLanguages,
  bundledThemes,
  getWasmInlined
);
const {
  codeToHtml,
  codeToHast,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  getSingletonHighlighter
} = /* @__PURE__ */ createSingletonShorthands(
  getHighlighter
);

export { bundledLanguages, bundledThemes, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, getHighlighter, getSingletonHighlighter, getWasmInlined };
