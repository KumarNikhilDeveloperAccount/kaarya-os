const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    console.log("2. Testing Network Pulse (Feed)...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('textarea', { timeout: 10000 });
    console.log("Textarea found, typing...");
    await page.type('textarea', 'This is a test post from E2E testing.');
    const newPostValue = await page.$eval('textarea', el => el.value);
    console.log("Textarea value after typing:", newPostValue);

    console.log("3. Testing Resume Parser...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('textarea', { timeout: 10000 });
    const textareas = await page.$$('textarea');
    if (textareas.length >= 2) {
        await textareas[0].click({ clickCount: 3 });
        await textareas[0].type('Test JD');
        const jdVal = await page.evaluate(el => el.value, textareas[0]);
        console.log("Resume JD value after typing:", jdVal);
    }
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
