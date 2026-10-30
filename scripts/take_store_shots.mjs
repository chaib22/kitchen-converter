import { chromium } from "playwright";

const BASE = "https://preview-chat-0d26e38b-aff4-4f33-b5a8-6f86ac7e1970.space-z.ai";
const OUT = "/home/z/my-project/download";

const shots = [
  { name: "store-1-ingredients-en", lang: "en", tab: "Ingredients", aria: "Amount", fill: "2" },
  { name: "store-2-oven-fr", lang: "fr", tab: "Four", aria: "Température en Celsius", fill: "180", switchTo: "°C" },
  { name: "store-3-volume-es", lang: "es", tab: "Volumen", aria: "Cantidad", fill: "2" },
  { name: "store-4-recipe-en", lang: "en", tab: "Recipe", aria: null, fill: null },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript((lang) => {
    try {
      localStorage.setItem("kitchen-converter-lang", lang);
      localStorage.setItem("kbc-install-dismissed", "1");
    } catch {}
  }, s.lang);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1200);
  // remove Next.js dev overlay (intercepts pointer events + shows badge in shots)
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
  });

  // click the tab (mobile bottom nav is the last nav in DOM)
  try {
    const btn = page.getByRole("button", { name: s.tab, exact: true }).first();
    await btn.click({ timeout: 6000, force: true });
  } catch {
    await page
      .locator('nav[aria-label="Converter sections"] button')
      .filter({ hasText: s.tab })
      .last()
      .click({ timeout: 6000 });
  }
  await page.waitForTimeout(700);

  if (s.switchTo) {
    await page
      .getByRole("radio", { name: s.switchTo, exact: true })
      .first()
      .click({ timeout: 4000 })
      .catch(() =>
        page
          .getByRole("button", { name: s.switchTo, exact: true })
          .first()
          .click({ timeout: 2000 })
          .catch(() => {}),
      );
    await page.waitForTimeout(400);
  }

  if (s.fill && s.aria) {
    const inp = page.locator(`input[aria-label="${s.aria}"]`).first();
    try {
      await inp.fill(s.fill, { timeout: 4000 });
    } catch {
      await page.locator("main input:visible").last().fill(s.fill, { timeout: 4000 });
    }
    await page.waitForTimeout(900);
  }

  await page.screenshot({ path: `${OUT}/${s.name}.png` });
  console.log("saved", s.name);
  await ctx.close();
}
await browser.close();
console.log("all screenshots done");
