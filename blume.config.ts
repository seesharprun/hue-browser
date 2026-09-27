import { defineConfig } from "blume";

export default defineConfig({
  title: "Hue Browser",
  description: "Manage your Philips Hue lights from one dashboard.",
  content: {
    root: "docs",
  },
  deployment: {
    site: "https://seesharprun.github.io",
    base: "/hue-browser",
  },
});
