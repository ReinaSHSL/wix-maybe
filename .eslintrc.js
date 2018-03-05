module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
        browser: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'eslint:recommended',
        'plugin:vue/essential'
    ],
    // required to lint *.vue files
    plugins: [
        'vue'
    ],
    // add your custom rules here
    rules: {
        "indent": ["error", 4, {"SwitchCase": 1}],
        "quotes": ["warn", "single", {"avoidEscape": true}],
        "semi": ["error", "never"],
        "no-console": "off",
        "no-unused-vars": "warn",
        "no-cond-assign": "off",
        "space-before-function-paren": ["error", "always"],
        "space-before-blocks": ["error", "always"],
        "keyword-spacing": ["error", {"before": true, "after": true}]
    }
}
