import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
// import pluginReactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  // React Hooks 규칙 추가
  {
    rules: {
      "react-hooks/rules-of-hooks": "error", // Hooks 규칙 체크
      "react-hooks/exhaustive-deps": "warn", // Effect dependencies 체크
    },
  },
];
