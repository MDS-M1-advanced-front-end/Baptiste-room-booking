import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";
type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

export default defineConfig((): UserConfig => ({
  plugins: [
    qwikCity(),
    qwikVite(),
    tsconfigPaths({ root: "." }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      injectRegister: false,
      workbox: {
        globPatterns: ["**/*.{js,css,svg,png,webmanifest}"],
        // Qwik City SSR: an SPA fallback would serve the shell for every route
        navigateFallback: null,
      },
    }),
  ],
  ssr: { noExternal: ["@room-booking/core"] },
}));
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = "";
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;
  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}
