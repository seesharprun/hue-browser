import { expect, test } from "@playwright/test";
import { fixtureData, groupBy, openDashboard, seedStorage } from "./helpers";

test("wizard navigation, loading state, stats, groups, sorting, and filters work", async ({
  page,
}) => {
  await seedStorage(page);
  let releaseDevices: () => void = () => undefined;
  const devicesReady = new Promise<void>((resolve) => {
    releaseDevices = resolve;
  });
  await page.route("**/api/bridges/devices", async (route) => {
    await devicesReady;
    await route.fulfill({ json: fixtureData.bridgeDevices });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  await expect(
    page.locator(".aura").filter({ has: page.locator(".skeleton") }),
  ).toBeVisible();
  releaseDevices();
  await expect(
    stat(page, "Devices").getByText("4", { exact: true }),
  ).toBeVisible();
  await expect(
    stat(page, "Lights").getByText("3", { exact: true }),
  ).toBeVisible();
  await expect(
    stat(page, "Rooms").getByText("2", { exact: true }),
  ).toBeVisible();
  await expect(
    stat(page, "Bridges").getByText("1", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Kitchen/ })).toBeVisible();
  await groupBy(page, "Zones");
  await expect(page.getByRole("heading", { name: /Evening/ })).toBeVisible();
  await groupBy(page, "Flat");
  await expect(page.getByRole("button", { name: /Edit/ })).toHaveCount(0);
  const names = page.locator(
    "tbody tr:not(:has(th)) td:first-child input.input",
  );
  await expect(names).toHaveCount(fixtureData.bridgeDevices.devices.length);
  await expect(names.nth(0)).toHaveValue("Desk Strip");
  await page.getByRole("button", { name: /Name.*Reverse this column/ }).click();
  await expect(names.nth(0)).toHaveValue("Window Lamp");
  await page.getByRole("button", { name: "Filter by Type" }).click();
  await page
    .locator("ul[popover]:popover-open")
    .getByText("motion sensor")
    .click();
  await expect(page.getByLabel("Name for Hall Motion Sensor")).toBeVisible();
  await expect(page.getByLabel("Name for Desk Strip")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByLabel("Name for Desk Strip")).toBeVisible();
});

test("a stored bridge opens the device table and each wizard step is clickable", async ({
  page,
}) => {
  await openDashboard(page);
  await page
    .locator("li.step")
    .first()
    .click({ position: { x: 12, y: 12 } });
  await expect(
    page.getByRole("heading", { name: "Connect to a Philips Hue bridge" }),
  ).toBeVisible();
  await page
    .locator("li.step")
    .last()
    .click({ position: { x: 12, y: 12 } });
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
});

function stat(page: import("@playwright/test").Page, label: string) {
  return page.locator(".stat").filter({ hasText: label });
}
