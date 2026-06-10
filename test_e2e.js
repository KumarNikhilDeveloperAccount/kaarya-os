const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  
  const results = [];
  const log = (msg) => {
    console.log(msg);
    results.push(msg);
  };

  try {
    log("1. Testing Homepage...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    log("Homepage loaded successfully.");

    log("2. Testing Network Pulse (Feed)...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle0' });
    await page.waitForSelector('textarea');
    await page.type('textarea', 'This is a test post from E2E testing.');
    const newPostValue = await page.$eval('textarea', el => el.value);
    if (newPostValue === 'This is a test post from E2E testing.') {
        log("Network Pulse: Typing works perfectly.");
    } else {
        log("Network Pulse: Failed to type.");
    }
    
    // Test Resume Parser
    log("3. Testing Resume Parser...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle0' });
    
    // Check if we can type in JD and rawResume
    const textareas = await page.$$('textarea');
    if (textareas.length >= 2) {
        // Clear and type
        await textareas[0].click({ clickCount: 3 });
        await textareas[0].type('Test JD');
        await textareas[1].click({ clickCount: 3 });
        await textareas[1].type('Test Resume');
        
        const jdVal = await page.evaluate(el => el.value, textareas[0]);
        const resVal = await page.evaluate(el => el.value, textareas[1]);
        if (jdVal === 'Test JD' && resVal === 'Test Resume') {
            log("Resume Parser: Typing in textareas works perfectly.");
        } else {
            log("Resume Parser: Failed to type in textareas.");
        }
    } else {
        log("Resume Parser: Could not find textareas.");
    }

    log("4. Testing Reels...");
    await page.goto('http://localhost:3000/reels', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000); // Wait for videos to load
    const videos = await page.$$('video');
    if (videos.length > 0) {
        log(`Reels: Found ${videos.length} videos loaded.`);
        const src = await page.evaluate(el => el.getAttribute('src') || el.currentSrc, videos[0]);
        log(`Reels: First video source is ${src}`);
    } else {
        log("Reels: No videos found.");
    }

  } catch (err) {
    log(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
    const fs = require('fs');
    fs.writeFileSync('test_results.txt', results.join('\n'));
    console.log("Done");
  }
})();
