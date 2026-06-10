const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    console.log("1. Testing Network Pulse (Feed)...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'domcontentloaded' });
    await wait(3000); // Wait for Fast Refresh and API loading
    
    await page.screenshot({ path: 'C:\\Users\\nkash\\.gemini\\antigravity\\brain\\696e0031-fd0c-4506-90a5-5281b13775a4\\feed_screenshot.png' });
    console.log("Feed screenshot taken.");

    // try typing
    const feedTextarea = await page.$('textarea');
    if (feedTextarea) {
        await feedTextarea.type('Test typing in feed');
        const val = await page.evaluate(el => el.value, feedTextarea);
        console.log("Feed textarea value:", val);
    } else {
        console.log("Feed textarea NOT FOUND");
    }

    console.log("2. Testing Resume Parser...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    
    await page.screenshot({ path: 'C:\\Users\\nkash\\.gemini\\antigravity\\brain\\696e0031-fd0c-4506-90a5-5281b13775a4\\resume_screenshot.png' });
    console.log("Resume screenshot taken.");

    const textareas = await page.$$('textarea');
    if (textareas.length >= 2) {
        await textareas[0].click({ clickCount: 3 });
        await textareas[0].type('Test JD typing');
        const val = await page.evaluate(el => el.value, textareas[0]);
        console.log("Resume textarea value:", val);
    } else {
        console.log("Resume textareas NOT FOUND");
    }

    console.log("3. Testing Reels...");
    await page.goto('http://localhost:3000/reels', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    await page.screenshot({ path: 'C:\\Users\\nkash\\.gemini\\antigravity\\brain\\696e0031-fd0c-4506-90a5-5281b13775a4\\reels_screenshot.png' });
    console.log("Reels screenshot taken.");

  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
