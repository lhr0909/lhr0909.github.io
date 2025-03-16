// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.divby0.io",
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
      changefreq: "weekly",
    }),
    react(),
  ],
  vite: {
    plugins: [
        tailwindcss(),
    ]
  }
});
