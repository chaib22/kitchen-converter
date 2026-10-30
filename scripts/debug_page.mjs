import { chromium } from "playwright";

const BASE = "https://preview-chat-0d26e38b-aff4-4f33-b5a8-6f86ac7e1970.space-z.ai";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
page.on("console", (m) => console.log("CONSOLE:", m.type(), m.text().slice(0, 120)));
page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 200)));
await page.goto(BASE, { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(3500);
console.log("TITLE:", await page.title());
const btns = await page.locator("button").allTextContents();
console.log("BUTTONS:", JSON.stringify(btns.map((b) => b.trim().replace(/\s+/g, " ")).slice(0, 20)));
const html = await page.content();
console.log("HAS-NAV-TEXT:", html.includes("Ingredients"), "| len:", html.length);
await page.screenshot({ path: "/home/z/my-project/download/debug-page.png" });
await browser.close();
