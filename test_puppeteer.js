const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Capture failed network requests
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth/')) {
      console.log(`API RESPONSE [${response.status()}] ${response.url()}`);
      try {
        const text = await response.text();
        console.log(`BODY: ${text}`);
      } catch (e) {}
    }
  });

  try {
    console.log("Navigating to signup...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log("Clicking Google Sign-In button...");
    // The button has "Google Sign-In" text
    const [button] = await page.$x("//button[contains(., 'Google Sign-In')]");
    if (button) {
      await button.click();
      console.log("Clicked! Waiting for network requests...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log("Could not find Google Sign-In button!");
    }
    
  } catch (e) {
    console.error("Error during test:", e);
  } finally {
    await browser.close();
  }
})();
