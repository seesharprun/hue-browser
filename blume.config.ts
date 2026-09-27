import { defineConfig } from "blume";

export default defineConfig({
  title: "Hue Browser",
  description: "Manage your Philips Hue lights from one dashboard.",
  feedback: false,
  theme: {
    accent: { light: "#a96a22", dark: "#e8b072" },
    action: "#3a7572",
    radius: "md",
    fonts: {
      display: { name: "Nunito Sans", weights: [400, 600, 700] },
      body: { name: "Nunito Sans", weights: [400, 600, 700] },
      mono: "ibm-plex-mono",
    },
  },
  content: {
    root: "docs",
  },
  deployment: {
    site: "https://seesharprun.github.io",
    base: "/hue-browser",
  },
});
