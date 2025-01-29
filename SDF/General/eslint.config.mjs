import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("plugin:suitescript/all", "eslint:recommended"), {
    languageOptions: {
        globals: {
            ...globals.amd,
            log: true,
            util: true,
        },

        ecmaVersion: "latest",
        sourceType: "script",
    },

    rules: {
        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "vars-on-top": "error",

        "no-unused-vars": ["error", {
            vars: "all",
            args: "none",
        }],

        "function-paren-newline": "off",
        "padded-blocks": "off",
        "func-names": "off",
        "max-len": ["error", 160],

        "no-trailing-spaces": ["error", {
            skipBlankLines: true,
        }],

        "no-loop-func": "error",
        curly: ["error", "all"],
        eqeqeq: ["error", "always"],
        "arrow-body-style": ["error", "always"],
        "suitescript/module-vars": "off",
        semi: ["error", "always"],
    },
}];