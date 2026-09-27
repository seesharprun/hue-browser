import { expect, test } from "@playwright/test";
import { bridge, groupBy, openDashboard, row } from "./helpers";

test("flat spreadsheet editing keeps focus, tracks pending changes, validates, discards, and saves", async ({
  page,
}) => {
  const edits: unknown[] = [];
  await page.route("**/api/bridges/edit", async (route) => {
    edits.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await openDashboard(page);
  await groupBy(page, "Flat");
  const kitchen = row(page, "Kitchen Pendant");
  const name = kitchen.locator("input.input").first();
  await name.click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Glow", { delay: 40 });
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("Kitchen Pendant Glow");
  await expect(
    page.getByRole("button", { name: /^Save changes/ }),
  ).toBeEnabled();
  await expect(
    page.locator(".indicator-item.badge-warning", { hasText: "1" }),
  ).toBeVisible();
  const zones = kitchen.getByRole("button", { name: /Evening, Morning/ });
  await zones.click();
  const openZones = page.locator("ul[popover]:popover-open");
  await openZones.getByText("Reading").click();
  await expect(openZones).toBeVisible();
  await openZones.getByText("Morning").click();
  await expect(openZones).toBeVisible();
  await name.fill("");
  await expect(
    page.getByRole("button", { name: /^Save changes/ }),
  ).toBeDisabled();
  await name.fill("Kitchen Pendant");
  await expect(
    page.getByRole("button", { name: /^Save changes/ }),
  ).toBeEnabled();
  await name.fill("Kitchen Pendant Glow");
  await page.getByRole("button", { name: "Discard" }).click();
  await expect(name).toHaveValue("Kitchen Pendant");
  await name.fill("Kitchen Pendant Glow");
  await page.getByRole("button", { name: /^Save changes/ }).click();
  await expect(page.getByText("Saved 1 device.")).toBeVisible();
  expect(edits).toEqual([
    {
      address: bridge.address,
      id: bridge.id,
      applicationKey: bridge.applicationKey,
      edit: {
        deviceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        name: "Kitchen Pendant Glow",
        roomId: "11111111-1111-4111-8111-111111111111",
        zoneIds: [
          "33333333-3333-4333-8333-333333333333",
          "55555555-5555-4555-8555-555555555555",
        ],
      },
    },
  ]);
});

test("grouped modal editing opens, blocks zones for non-lights, and closes without saving", async ({
  page,
}) => {
  await openDashboard(page);
  await row(page, "Kitchen Pendant")
    .getByRole("button", { name: /Edit/ })
    .click();
  const kitchenDialog = page.getByRole("dialog", {
    name: "Edit Kitchen Pendant",
  });
  await expect(kitchenDialog).toBeVisible();
  await expect(kitchenDialog.getByLabel("Reading")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await row(page, "Hall Motion Sensor")
    .getByRole("button", { name: /Edit/ })
    .click();
  const sensorDialog = page.getByRole("dialog", {
    name: "Edit Hall Motion Sensor",
  });
  await expect(
    sensorDialog.getByText(
      "This device has no light, so it cannot join a zone.",
    ),
  ).toBeVisible();
  await expect(sensorDialog.getByLabel("Evening")).toBeDisabled();
  await page.mouse.click(20, 20);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Test Kitchen Pendant/ }),
  ).toBeVisible();
});
