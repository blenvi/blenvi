# `@repo/eslint-config`

Collection of shared ESLint configurations for the monorepo.

## Available Configurations

### `@repo/eslint-config/base`

Base ESLint configuration with TypeScript, Prettier, and Turbo support.

### `@repo/eslint-config/next`

Comprehensive Next.js configuration with:

- React and React Hooks rules
- Import sorting with `eslint-plugin-import-x`
- Accessibility rules with `eslint-plugin-jsx-a11y`
- TypeScript support
- Prettier integration

### `@repo/eslint-config/react-internal`

Internal React library configuration.

## Usage

In your `eslint.config.js` or `eslint.config.mjs`:

```javascript
// For Next.js apps
export { nextJsConfig as default } from '@repo/eslint-config/next';

// For base configuration
import { config } from '@repo/eslint-config/base';
export default config;
```
