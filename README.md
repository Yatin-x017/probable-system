# React + TypeScript + Vite

## CMS & Analytics setup (read this first)
site is ready at domain
This project now has a full CMS and Vercel Analytics wired in:

1. **Run the SQL migration.** Open your Supabase project → SQL Editor → paste the contents of
   `supabase/migrations/0001_site_content.sql` → Run. This creates the `site_content` table
   (with public-read / admin-write policies) and the `site-content` storage bucket used for
   uploaded images.
2. **Install dependencies.** `npm install` (this pulls in `@vercel/analytics`, added to
   `package.json`).
3. **Edit content.** Log into `/admin/login`, then go to `/admin/content`. Every section — Home
   hero, About page (bio, portrait, skills, experience), Site Settings (site name, footer,
   social links), and Contact — is editable there, including images. Nothing on those pages is
   hardcoded anymore; if a section has never been saved, the site falls back to sensible
   placeholder copy so it never renders blank.
4. **Deploy to Vercel.** The `<Analytics />` component from `@vercel/analytics/react` is already
   mounted in `App.tsx`. Once you deploy and enable Analytics for the project in the Vercel
   dashboard (Project → Analytics tab), real visitor data will start flowing in — it's a separate
   dashboard from `/admin`, not merged into the demo charts there.



This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
