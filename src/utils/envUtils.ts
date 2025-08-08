/**
 * Utility functions for handling environment variables
 */

// Function to log all environment variables
export const logEnvironmentVariables = () => {
  console.log("=== Environment Variables ===");

  // Log all import.meta.env variables
  console.log("import.meta.env:", import.meta.env);
  // PROD_BACKEND_URL=http://51.8.80.47:5001
  // PROD_BC_URL=https://api.businesscentral.dynamics.com/v2.0/24528e89-fa53-4fc5-9847-429bb50802ff/ROMProduction/

  // Log specific environment variables
  console.log("ENVIRONMENT:", import.meta.env.ENVIRONMENT);
  console.log("ENVIRONMENT_TYPE:", import.meta.env.ENVIRONMENT_TYPE);
  console.log("PROD_BACKEND_URL:", import.meta.env.VITE_PROD_BACKEND_URL);
  console.log("PROD_BC_URL:", import.meta.env.VITE_PROD_BC_URL);
  console.log("BACKEND_URL_HRP:", import.meta.env.VITE_EHUB_BACKEND_URL_HRP);
  console.log("BC_URL_HRP:", import.meta.env.VITE_EHUB_BC_URL_HRP);
  console.log("BC_URL_ROM:", import.meta.env.VITE_EHUB_BC_URL_ROM);
  console.log("BACKEND_URL_ROM:", import.meta.env.VITE_EHUB_BACKEND_URL_ROM);

  // Log any custom VITE_ variables
  const viteEnvVars = Object.keys(import.meta.env).filter((key) =>
    key.startsWith("VITE_")
  );
  console.log("All VITE_ variables:", viteEnvVars);

  console.log("=== End Environment Variables ===");
};

// Function to get environment variable with fallback
export const getEnvVar = (key: string, fallback: string = ""): string => {
  return import.meta.env[key] || fallback;
};

// Function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.ENVIRONMENT === "development";
};

// Function to check if we're in production mode
export const isProduction = (): boolean => {
  return import.meta.env.ENVIRONMENT === "production";
};

// Function to get the current environment type
export const getEnvironmentType = (): string => {
  return import.meta.env.ENVIRONMENT_TYPE;
};

// Function to get the appropriate backend URL based on environment
export const getBackendUrl = (): string => {
  const envType = getEnvironmentType();

  switch (envType) {
    case "HRP":
      return import.meta.env.VITE_EHUB_BACKEND_URL_HRP || "";
    case "ROM":
      return (
        import.meta.env.VITE_EHUB_BACKEND_URL_ROM ||
        import.meta.env.VITE_EHUB_BACKEND_URL ||
        ""
      );
    case "ROM_TEST":
      return import.meta.env.VITE_EHUB_BACKEND_URL_ROMTEST || "";
    default:
      return import.meta.env.VITE_EHUB_BACKEND_URL || "";
  }
};

// Function to get the appropriate BC URL based on environment
export const getBCUrl = (): string => {
  const envType = getEnvironmentType();

  switch (envType) {
    case "HRP":
      return (
        import.meta.env.VITE_EHUB_BC_URL_HRP ||
        import.meta.env.VITE_EHUB_BC_URL ||
        ""
      );
    case "ROM":
      return (
        import.meta.env.VITE_EHUB_BC_URL_ROM ||
        import.meta.env.VITE_EHUB_BC_URL ||
        ""
      );
    default:
      return import.meta.env.VITE_EHUB_BC_URL || "";
  }
};
