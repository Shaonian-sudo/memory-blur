import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, ".vcheck");
const edgePath = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const sceneCuts = [7.65, 16.38, 22.53, 30.38, 36.23, 42.58, 49.61, 54.96, 62.89, 69.24, 76.27];
const bounds = [0, ...sceneCuts, 88];
const times = bounds.slice(0, -1).map((start, i) => (start + bounds[i + 1]) / 2);

const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(root, "index.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.evaluate((cuts) => window.configureTiming({ beatSeconds: 0.798, beatPhaseSeconds: 0, sceneCutTimes: cuts, duration: 88 }), sceneCuts);
await mkdir(outDir, { recursive: true });
for (let i = 0; i < times.length; i += 1) {
  await page.evaluate((t) => window.renderAt(t), times[i]);
  await page.screenshot({ path: join(outDir, `scene_${String(i + 1).padStart(2, "0")}_${times[i].toFixed(1)}.png`), type: "png" });
}
await browser.close();
console.log("stills saved to", outDir);
console.log("scene center times:", times.map((t) => t.toFixed(2)).join(", "));
