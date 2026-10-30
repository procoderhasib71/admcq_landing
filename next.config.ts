import type { NextConfig } from "next";

// App Hosting build এর সময় FIREBASE_WEBAPP_CONFIG নিজেই দেয়; console এ NEXT_PUBLIC_FIREBASE_* না দিলেও
// সেখান থেকে Firebase config নেওয়া হয়, তাই repo তে কোনো key রাখতে হয় না
const webapp = (() => {
  try {
    return JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || "{}") as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
})();
const pick = (name: string, key: string) => process.env[name] || webapp[key] || "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: pick("NEXT_PUBLIC_FIREBASE_API_KEY", "apiKey"),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: pick("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "authDomain"),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: pick("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "projectId") || "machranga-eae85",
    NEXT_PUBLIC_FIREBASE_APP_ID: pick("NEXT_PUBLIC_FIREBASE_APP_ID", "appId"),
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
