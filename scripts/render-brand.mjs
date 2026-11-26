import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = path.resolve("assets/branding");
await mkdir(OUT, { recursive: true });

const BLUE = "#1A46C4";
const BLUE_DARK = "#12389F";
const BLUE_LIGHT = "#2452CC";
const GOLD = "#F2B01E";
const WHITE = "#FFFFFF";

const R = 225;
const CIRC = 2 * Math.PI * R;
const GAP = CIRC * 0.29;
const DASH = CIRC - GAP;

function mark(mono = false) {
  const c = mono ? WHITE : WHITE;
  const check = mono ? WHITE : GOLD;
  return `
    <circle cx="496" cy="512" r="${R}" fill="none" stroke="${c}" stroke-width="86"
      stroke-linecap="round" stroke-dasharray="${DASH} ${GAP}"
      transform="rotate(-52 496 512)" />
    <path d="M526 520 L611 605 L796 380" fill="none" stroke="${check}"
      stroke-width="78" stroke-linecap="round" stroke-linejoin="round" />
  `;
}

/** Refined A: smaller check that sits in the C opening instead of over it. */
function markA2(mono = false) {
  const check = mono ? WHITE : GOLD;
  return `
    <circle cx="496" cy="512" r="${R}" fill="none" stroke="${WHITE}" stroke-width="86"
      stroke-linecap="round" stroke-dasharray="${DASH} ${GAP}"
      transform="rotate(-52 496 512)" />
    <path d="M556 520 L616 580 L744 408" fill="none" stroke="${check}"
      stroke-width="64" stroke-linecap="round" stroke-linejoin="round" />
  `;
}

const iconA = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_LIGHT}"/>
      <stop offset="0.55" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${mark()}
</svg>`;

const iconB = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_LIGHT}"/>
      <stop offset="0.55" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg2)"/>
  <path d="M270 256 Q270 230 296 230 H570 L660 320 V704 Q660 730 634 730 H296 Q270 730 270 704 Z" fill="${WHITE}"/>
  <path d="M570 230 L660 320 H570 Z" fill="#DCE6FB"/>
  <path d="M570 230 V320 H660" fill="none" stroke="#C9D6FA" stroke-width="3"/>
  <rect x="350" y="400" width="230" height="24" rx="12" fill="${BLUE}"/>
  <rect x="350" y="460" width="250" height="24" rx="12" fill="${BLUE}"/>
  <rect x="350" y="520" width="180" height="24" rx="12" fill="${BLUE}"/>
  <circle cx="680" cy="680" r="112" fill="${GOLD}"/>
  <path d="M626 680 L666 720 L738 636" fill="none" stroke="${WHITE}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const splashA = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 372) scale(0.84) translate(-512 -512)">
    ${mark()}
  </g>
  <text x="512" y="752" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
    font-size="70" font-weight="800" letter-spacing="4" fill="${WHITE}">CSE PREP PH</text>
  <text x="512" y="806" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
    font-size="26" font-weight="700" letter-spacing="6" fill="${GOLD}">CIVIL SERVICE EXAM REVIEWER</text>
</svg>`;

const iconA2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bgA2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_LIGHT}"/>
      <stop offset="0.55" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bgA2)"/>
  ${markA2()}
</svg>`;

const splashA2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 372) scale(0.84) translate(-512 -512)">
    ${markA2()}
  </g>
  <text x="512" y="750" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
    font-size="74" font-weight="800" letter-spacing="4" fill="${WHITE}">CSE PREP PH</text>
  <text x="512" y="810" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
    font-size="32" font-weight="700" letter-spacing="5" fill="${GOLD}">CIVIL SERVICE EXAM REVIEWER</text>
</svg>`;

const foregroundA2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.9) translate(-512 -512)">
    ${markA2()}
  </g>
</svg>`;

const foregroundA = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.55) translate(-512 -512)">
    ${mark()}
  </g>
</svg>`;

const monochromeA = `<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
  <g transform="translate(216 216) scale(0.46) translate(-512 -512)">
    ${mark(true)}
  </g>
</svg>`;

const brandMark = iconA2.replace(
  'width="1024" height="1024"',
  'width="256" height="256"',
);

const monochromeA2 = `<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
  <g transform="translate(216 216) scale(0.46) translate(-512 -512)">
    ${markA2(true)}
  </g>
</svg>`;

const faviconA2 = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_LIGHT}"/>
      <stop offset="0.55" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg4)"/>
  ${markA2()}
</svg>`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1,
});

async function render(svg, width, height, file) {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>${svg}</body></html>`,
  );
  await page.screenshot({ path: path.join(OUT, file), omitBackground: true });
  console.log("rendered", file);
}

await render(iconA, 1024, 1024, "icon-a.png");
await render(iconB, 1024, 1024, "icon-b.png");
await render(iconA2, 1024, 1024, "icon-a2.png");
await render(splashA2, 1024, 1024, "splash-a2.png");
await render(foregroundA2, 1024, 1024, "foreground-a2.png");
await render(monochromeA, 432, 432, "monochrome-a.png");
await render(monochromeA2, 432, 432, "monochrome-a2.png");
await render(faviconA2, 64, 64, "favicon-a2.png");
await render(brandMark, 256, 256, "brand-mark.png");

await browser.close();
console.log("done");
