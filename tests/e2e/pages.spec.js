const { test, expect } = require("@playwright/test");

const pages = [
  { url: "/", title: "Home | Carbondale Bike Project" },
  { url: "/about/", title: "About | Carbondale Bike Project" },
  { url: "/programs/", title: "Our Programs | Carbondale Bike Project" },
  { url: "/how-can-i-help/", title: "How Can I Help | Carbondale Bike Project" },
  { url: "/contact/", title: "Contact | Carbondale Bike Project" },
];

for (const { url, title } of pages) {
  test(`${url} loads with correct title`, async ({ page }) => {
    const response = await page.goto(url);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(title);
  });
}

test("homepage renders Kickstand Club and donation sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Kickstand Club" })).toBeVisible();
  await expect(
    page.getByText(/PayPal/i).first().or(page.getByText(/Venmo/i).first())
  ).toBeVisible();
});

test("programs page renders responsive images", async ({ page }) => {
  await page.goto("/programs/");
  const images = page.locator("picture img");
  await expect(images.first()).toBeVisible();
});
