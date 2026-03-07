const { test, expect } = require("@playwright/test");

test("desktop nav links resolve to correct pages", async ({ page }) => {
  await page.goto("/");
  // Desktop nav — check href attributes on nav links
  await expect(page.getByRole("link", { name: "About" }).first()).toHaveAttribute("href", "/about/");
  await expect(page.getByRole("link", { name: "Programs" }).first()).toHaveAttribute("href", "/programs/");
  await expect(page.getByRole("link", { name: "Contact" }).first()).toHaveAttribute("href", "/contact/");
  await expect(page.getByRole("link", { name: "How Can I Help" }).first()).toHaveAttribute("href", "/how-can-i-help/");
});

test("mobile menu toggle opens navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  // Find mobile menu button by aria-label
  const menuButton = page.locator("#mobile-menu-button");
  await menuButton.click();
  // Mobile nav links should be visible after menu opens
  await expect(page.locator("#mobile-menu").getByRole("link", { name: "About" })).toBeVisible();
});
