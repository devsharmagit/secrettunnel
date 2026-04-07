import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node18",
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  platform: "node", // ✅ VERY IMPORTANT
  external: ["readline/promises"], // ✅ mark as external

});