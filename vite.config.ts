import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.ENVIRONMENT_TYPE === "ROM_TEST" ||
    process.env.ENVIRONMENT_TYPE === "ROM"
      ? "/rom/"
      : "/",
  plugins: [react()],
  define: {
    "import.meta.env.ENVIRONMENT": JSON.stringify(
      process.env.ENVIRONMENT || "development"
    ),
    "import.meta.env.ENVIRONMENT_TYPE": JSON.stringify(
      process.env.ENVIRONMENT_TYPE || "HRP"
    ),
    // "import.meta.env.ENVIRONMENT_TYPE": JSON.stringify("HRP"),

    "import.meta.env": JSON.stringify(process.env),
    "import.meta.env.VITE_EHUB_BACKEND_URL": JSON.stringify(
      process.env.VITE_EHUB_BACKEND_URL || "http://51.8.80.47:5001"
    ),
    "import.meta.env.VITE_EHUB_BC_URL": JSON.stringify(
      process.env.VITE_EHUB_BC_URL ||
        "https://api.businesscentral.dynamics.com/v2.0/24528e89-fa53-4fc5-9847-429bb50802ff/ROMProduction/"
    ),

    // ---------------------------------- HRP ----------------------------------

    "import.meta.env.VITE_EHUB_BACKEND_URL_HRP": JSON.stringify(
      process.env.VITE_EHUB_BACKEND_URL_HRP ||
        "https://demo-portal-backend-h13a.onrender.com/"
    ),
    "import.meta.env.VITE_EHUB_BC_URL_HRP": JSON.stringify(
      process.env.VITE_EHUB_BC_URL_HRP ||
        "https://api.businesscentral.dynamics.com/v2.0/df78e20f-3ca1-4018-9157-8bedb2673da2/HRPSandbox4Demos/"
    ),

    // ---------------------------------- End of HRP ----------------------------------

    // ---------------------------------- ROM TEST ------------------------------------
    "import.meta.env.VITE_EHUB_BC_URL_ROM": JSON.stringify(
      process.env.VITE_EHUB_BC_URL_ROM ||
        "https://api.businesscentral.dynamics.com/v2.0/24528e89-fa53-4fc5-9847-429bb50802ff/ROMProductionCopy2/"
      // "https://api.businesscentral.dynamics.com/v2.0/24528e89-fa53-4fc5-9847-429bb50802ff/ROMProduction/"
    ),
    "import.meta.env.VITE_EHUB_BACKEND_URL_ROM": JSON.stringify(
      process.env.VITE_EHUB_BACKEND_URL_ROM || "http://51.8.80.47:5001"
    ),
    // ---------------------------------- End of ROM TEST ------------------------------------
  },
  build: {
    minify: "terser",
    terserOptions: {
      keep_fnames: true,
      keep_classnames: true,
      compress: {
        drop_console: false, // Keep console logs if needed
        pure_funcs: ["console.log"], // Or remove console.logs in production
        arguments: false, // Add this line
      },
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    keepNames: true,
  },
});
