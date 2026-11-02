import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Serviços Supabase: o cliente tipado não suporta joins relacionais dinâmicos,
  // por isso o cast `as any` é necessário nestes arquivos.
  {
    files: [
      "src/services/**/*.ts",
      "src/contexts/AuthContext.tsx",
      "src/pages/Denuncias.tsx",
      "src/pages/Licencas.tsx",
      "src/pages/Equipe.tsx",
      "src/pages/LoginPage.tsx",
      "src/pages/PublicPortal.tsx",
      "src/components/settings/SeedDataManager.tsx",
      "supabase/functions/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Componentes shadcn/ui gerados automaticamente — interfaces vazias são padrão do template.
  {
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // tailwind.config.ts usa require() pois o plugin não tem tipos ESM.
  {
    files: ["tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
