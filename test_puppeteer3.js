const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
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
    
    console.log("Waiting for 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if Firebase is initialized correctly
    const isFirebaseDefined = await page.evaluate(() => {
        return typeof window !== 'undefined' && document.body.innerHTML.includes('firebase');
    });
    console.log("Firebase mentioned in body?", isFirebaseDefined);
    
    // Simulate clicking Google Sign In
    console.log("Clicking Google Sign-In...");
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (let b of btns) {
            if (b.innerText.includes('Google')) {
                b.click();
            }
        }
    });
    
    console.log("Waiting 5s for popup/network...");
    await new Promise(r => setTimeout(r, 5000));
    
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
