import { expect, test } from "@playwright/test";
import { bridge, openDashboard, seedStorage } from "./helpers";

test("identify, power, and colour controls send commands and show a busy row", async ({
  page,
}) => {
  const commands: unknown[] = [];
  let releaseFirstCommand: () => void = () => undefined;
  let markFirstCommandReady: () => void = () => undefined;
  const firstCommandReady = new Promise<void>((resolve) => {
    markFirstCommandReady = resolve;
  });
  await page.route("**/api/bridges/command", async (route) => {
    commands.push(route.request().postDataJSON());
    if (commands.length === 1) {
      await new Promise<void>((resolve) => {
        releaseFirstCommand = resolve;
        markFirstCommandReady();
      });
    }
    await route.fulfill({ json: { ok: true } });
  });
  await openDashboard(page);
  const testButton = page.getByRole("button", { name: /Test Kitchen Pendant/ });
  await testButton.click();
  await page.getByRole("button", { name: "Flash to identify" }).click();
  await firstCommandReady;
  await expect(testButton).toBeDisabled();
  releaseFirstCommand();
  await expect(
    page.getByText("Kitchen Pendant flashed.").first(),
  ).toBeVisible();
  await testButton.click();
  await page.getByRole("button", { name: "Turn off" }).click();
  await expect(testButton).toBeEnabled();
  await testButton.click();
  await page.getByRole("button", { name: "Red" }).click();
  expect(commands).toEqual([
    command("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", { action: "identify" }),
    command("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", { action: "off" }),
    command("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", {
      action: "color",
      hex: "#ff0000",
    }),
  ]);
});

test("edit failures surface an error toast naming the device", async ({
  page,
}) => {
  await page.route("**/api/bridges/edit", async (route) => {
    await route.fulfill({
      status: 500,
      json: { error: "Bridge rejected the edit." },
    });
  });
  await openDashboard(page);
  await page.getByRole("button", { name: /Edit Kitchen Pendant/ }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.locator('[role="alert"]').filter({
      hasText: "Kitchen Pendant: Bridge rejected the edit.",
    }),
  ).toBeVisible();
});

test("discovery 520 responses surface retry guidance", async ({ page }) => {
  await seedStorage(page, []);
  await page.route("**/api/bridges/discover", async (route) => {
    await route.fulfill({
      status: 520,
      json: {
        error:
          "Philips Hue online discovery returned HTTP 520. Try again in about 2 minutes. Enter a bridge IP address instead.",
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Search my network" }).click();
  await expect(
    page
      .locator('[role="alert"]')
      .filter({ hasText: "Try again in about 2 minutes" }),
  ).toBeVisible();
});

function command(resource: string, commandBody: unknown) {
  return {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
    resource,
    command: commandBody,
  };
}
