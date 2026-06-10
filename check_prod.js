const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`CONSOLE: ${msg.type()} - ${msg.text()}`));
  page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));
  
  await page.goto('https://kaarya-os.vercel.app', { waitUntil: 'networkidle' });
  
  console.log("Page loaded.");
  await browser.close();
})();
