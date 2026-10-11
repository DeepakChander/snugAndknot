import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Security-relevant rules, enforced as errors.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'react/no-danger': 'warn',
      // React Compiler advisories. This project does not run the React Compiler, and these
      // flag patterns that are correct without it (hydration-safe state in effects, mutating
      // three.js uniforms each frame), so they stay visible as warnings.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', '.data/**', 'next-env.d.ts']),
])
