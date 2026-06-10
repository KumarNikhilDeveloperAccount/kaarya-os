const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    console.log("Logging in...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await wait(2000);
    await page.type('input[type="email"]', 'nkashyapnikhilnk@gmail.com');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to feed
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Logged in successfully. Navigating to Feed...");
    await wait(3000); 

    // Test Messages
    console.log("Testing Messages...");
    await page.goto('http://localhost:3000/messages', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    const chats = await page.$$('button');
    let chatFound = false;
    for (let btn of chats) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Acme Corp')) {
            console.log("SUCCESS: Found real message from Acme Corp!");
            chatFound = true;
            break;
        }
    }
    if (!chatFound) console.log("FAILURE: Messages still mock or empty");

    // Test Orbit
    console.log("Testing Orbit...");
    await page.goto('http://localhost:3000/orbit', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    const orbitText = await page.evaluate(() => document.body.textContent);
    if (orbitText && orbitText.includes('Senior Frontend Engineer')) {
        console.log("SUCCESS: Found real job in orbit!");
    } else {
        console.log("FAILURE: Orbit still empty/mock");
    }

    // Test Partners
    console.log("Testing Partners...");
    await page.goto('http://localhost:3000/partners', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    const partnersText = await page.evaluate(() => document.body.textContent);
    if (partnersText && partnersText.includes('Acme Corp')) {
        console.log("SUCCESS: Found real company in partners!");
    } else {
        console.log("FAILURE: Partners still empty/mock");
    }

  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
