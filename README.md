## Development tips

- If your editor shows yellow warnings for `@apply` in `styles/globals.css`, it is safe to ignore. Tailwind v4 processes `@apply` through PostCSS (`@tailwindcss/postcss`).
- To silence in VS Code, add a workspace setting:

```
// .vscode/settings.json
{
  "css.lint.unknownAtRules": "ignore"
}
```

HI
