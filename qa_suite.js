const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // 1. Go to Feed to let auth happen
    console.log("Testing Feed...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'domcontentloaded' });
    await wait(3000); 

    // 2. Test Reels Upload
    console.log("Testing Reels...");
    await page.goto('http://localhost:3000/reels', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    // Find upload FAB
    const fab = await page.$('.bottom-6.right-6 button, .bottom-6.right-12 button');
    if (fab) {
        await fab.click();
        await wait(500);
        // We won't actually upload a file but check if modal opens
        const textarea = await page.$('textarea');
        if (textarea) console.log("Reels upload modal works.");
        else console.log("Reels upload modal failed.");
    } else {
        console.log("Reels FAB not found");
    }

    // 3. Test Messages
    console.log("Testing Messages...");
    await page.goto('http://localhost:3000/messages', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    const chats = await page.$$('button');
    let chatFound = false;
    for (let btn of chats) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Acme Corp')) {
            console.log("Found real message from Acme Corp!");
            chatFound = true;
            await btn.click();
            await wait(1000);
            const input = await page.$('input[type="text"]');
            if (input) console.log("Chat input ready.");
            break;
        }
    }
    if (!chatFound) console.log("Messages still mock or empty");

    // 4. Test Orbit
    console.log("Testing Orbit...");
    await page.goto('http://localhost:3000/orbit', { waitUntil: 'domcontentloaded' });
    await wait(3000);
    const text = await page.evaluate(() => document.body.textContent);
    if (text && text.includes('Senior Frontend Engineer')) {
        console.log("Found real job in orbit!");
    } else {
        console.log("Orbit still empty/mock");
    }

  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }
})();
