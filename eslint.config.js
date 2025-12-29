import globals from "globals";

export default [
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
