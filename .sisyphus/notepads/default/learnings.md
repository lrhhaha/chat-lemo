
- **CodePreview Component**: The `CodePreview` component uses an iframe with Babel standalone to render React code dynamically. It requires `react` and `react-dom` to be available in the iframe context. It's useful for live coding playgrounds.
- **Next.js Linting**: `next lint` might behave unexpectedly if passed arguments that look like directories but aren't intended as such, or if the environment is slightly different. Using `tsc` for type checking is a reliable fallback for verification.
