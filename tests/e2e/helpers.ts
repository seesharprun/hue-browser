import { expect, type Page } from "@playwright/test";
import fixture from "../fixtures/bridge-devices.json";

export const data = fixture;
export const bridge = fixture.bridges[0];

export async function seedStorage(page: Page, bridges = fixture.bridges) {
  await page.addInitScript((saved) => {
    localStorage.setItem("hue-browser-bridges", JSON.stringify(saved));
    localStorage.setItem("hue-browser-theme", "lofi-art-night");
    window.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal{display:none!important}";
      document.head.append(style);
    });
  }, bridges);
}

export async function routeFixtureDevices(page: Page, delay = 0) {
  await page.route("**/api/bridges/devices", async (route) => {
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    await route.fulfill({ json: fixture.bridgeDevices });
  });
}

export async function openDashboard(page: Page) {
  await seedStorage(page);
  await routeFixtureDevices(page);
  await page.goto("/");
  const devicesStep = page.getByRole("button", {
    name: "Go to the Devices step",
  });
  if ((await devicesStep.count()) > 0) {
    await devicesStep.click({ timeout: 500 }).catch(() => undefined);
  }
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Kitchen Pendant", exact: true }),
  ).toBeVisible();
}

export async function groupBy(page: Page, label: "Rooms" | "Zones" | "Flat") {
  await page.locator(".fab > button").focus();
  await expect(
    page.getByRole("button", { name: `Group by ${label}` }),
  ).toBeVisible();
  await page.getByRole("button", { name: `Group by ${label}` }).click();
}

export function row(page: Page, name: string) {
  const rows = page.getByRole("table").getByRole("row");
  const readOnly = rows.filter({
    has: page.getByRole("cell", { name, exact: true }),
  });
  const editable = rows.filter({ has: page.getByLabel(`Name for ${name}`) });
  return readOnly.or(editable).first();
}
