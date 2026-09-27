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
  github: {
    owner: "seesharprun",
    repo: "hue-browser",
  },
  seo: {
    og: {
      palette: {
        accent: "#e8b072",
        background: "#141a2e",
        foreground: "#cfd4e8",
        muted: "#8b93b8",
        border: "#3c4468",
      },
    },
    software: {
      applicationCategory: "HomeAutomationApplication",
      license: "MIT",
      operatingSystem: "Docker",
      price: 0,
      sameAs: [
        "https://github.com/seesharprun/hue-browser",
        "https://github.com/seesharprun/hue-browser/pkgs/container/hue-browser",
      ],
    },
  },
  agents: {
    llmsTxt: {
      details:
        "Reach for Hue Browser when someone needs to inventory or reorganize the Philips Hue devices in a home across one or more bridges. It is a self-hosted web app, run with `docker run -p 3000:3000 ghcr.io/seesharprun/hue-browser`, that pairs with bridges over the local network and presents every device in a sortable, filterable table grouped by room or zone. It is for naming, grouping, and identifying fixtures, not for setting scenes or automations.",
    },
  },
  deployment: {
    site: "https://seesharprun.github.io",
    base: "/hue-browser",
  },
});
