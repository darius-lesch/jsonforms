# Vuetify 4 Migration Audit Report

## 1. Executive Summary
The proposed migration of the `@jsonforms/vue-vuetify` and `@jsonforms/examples` packages from Vuetify 3 to Vuetify 4 is assessed as **Low to Medium Complexity**.
The dependency environment is already well-positioned to accept Vuetify 4 without massive upstream disruption. The ESLint codemod covers the majority of the template-level deprecated props and classes. The largest risks reside in hardcoded snapshot tests and potential CSS layering specificity issues caused by Vuetify 4's shift to Material Design 3 and CSS cascade `@layer`.

## 2. Dependency Matrix
The monorepo's dependencies natively satisfy Vuetify 4.0 peer requirements.
- **`vue`**: Vuetify 4 requires `^3.5.0`. The monorepo currently uses `^3.5.17`. (No action needed)
- **`vite-plugin-vuetify`**: Vuetify 4 requires `>=2.1.0`. The monorepo currently uses `^2.1.1`. (No action needed)
- **`typescript`**: Vuetify 4 requires `>=4.7`. The monorepo currently uses `~5.8.3`. (No action needed)

**Conclusion:** No cascading major version bumps for Vite, Vitest, or Vue are required. A direct bump of `vuetify` to `^4.0.0` in `packages/vue-vuetify/package.json` is sufficient.

## 3. Codemod Efficacy
A dry-run evaluation using `eslint-plugin-vuetify@2.7.3` with the `plugin:vuetify/recommended-v4` ruleset successfully identified and auto-fixed the following legacy implementations:

**100% Automatable via ESLint:**
- **Legacy Grid Props**: `justify="center"` and `align-self="center"` on `<v-row>` and `<v-col>` elements are successfully migrated to `class="justify-center"` and `class="align-self-center"`.
  - Found in: `ArrayControlRenderer.vue`, `MixedRenderer.vue`, `ArrayLayoutRenderer.vue`.
- **Deprecated Typography**: Material Design 2 typography classes like `text-h5` and `text-h6` are successfully migrated to MD3 equivalents (`text-headline-medium`, `text-headline-small`).
  - Found in: `ListWithDetailRenderer.vue`, `OneOfRenderer.vue`, `OneOfTabRenderer.vue`, `ArrayLayoutRenderer.vue`.

**Manual Rewrites Required:**
The ESLint codemod performed remarkably well on standard usage. No components were flagged as fundamentally incompatible, requiring manual logic rewrites based purely on the static analysis phase.

## 4. Style & CSS Risks
While hardcoded typography and grid classes are managed by the linter, there are custom CSS specificity risks associated with Vuetify 4's transition to CSS cascade `@layer`.

**Custom Specificity Risks:**
- `packages/vue-vuetify/src/controls/DateTimeControlRenderer.vue`: Contains `:deep(.v-picker)` overrides.
- `packages/vue-vuetify/src/layouts/ArrayLayoutRenderer.vue`: Contains `:deep(.v-toolbar__content) { padding-left: 0; }` overrides.
- `packages/vue-vuetify/src/complex/ArrayControlRenderer.vue`: Contains `padding-left: 0 !important;` overrides.

*Note: These deep selectors and `!important` flags may lose their specificity or behave unpredictably when Vuetify 4's base styles are shifted into the unlayered or layered cascade hierarchy. These must be manually verified visually.*

## 5. Test Suite Remediation Plan
The test suite is generally robust, preferring accessible attributes (`aria-label`) or generic HTML elements (`input`, `label`) for DOM traversal.

**High-Risk Tests:**
1. **`packages/vue-vuetify/tests/unit/layout/CategorizationStepperRenderer.spec.ts`**
   - **Risk:** Line 80 relies on `stepper.findAll('.v-stepper-item__avatar')`. Vuetify 4 alters internal component DOM structures, making internal classes like `.v-stepper-item__avatar` extremely brittle.
   - **Remediation:** Refactor to find elements via data attributes or accessible roles if possible, or update the class selector manually once the new DOM structure is known.
2. **Snapshot Tests (`__snapshots__/*`)**
   - **Risk:** All existing Vitest snapshots hardcode the generated Vuetify 3 DOM (including deeply nested `v-progress-linear` and `v-toolbar` structures).
   - **Remediation:** Snapshot tests will fail globally. They must be regenerated (`pnpm run test --update`) *after* visual verification of the components.

## 6. Next Steps
1. **Dependency Update:** Update `vuetify` to `^4.0.0` in `packages/vue-vuetify/package.json`.
2. **Execute Codemod:** Run `eslint-plugin-vuetify` with `--fix` across `packages/vue-vuetify/src` to resolve grid and typography deprecations.
3. **Manual CSS Review:** Start the dev server (`pnpm run dev`) and visually inspect `DateTimeControlRenderer`, `ArrayLayoutRenderer`, and `ArrayControlRenderer` to ensure custom CSS overrides still apply against Vuetify 4 layers.
4. **Unit Test Refactor:** Update the brittle DOM selector in `CategorizationStepperRenderer.spec.ts`.
5. **Snapshot Regeneration:** Run `pnpm run test --update` in `packages/vue-vuetify` to generate new Vuetify 4 DOM snapshots.
