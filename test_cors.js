const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to https://kaarya-os.vercel.app/signup ...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle2' });
    
    console.log("Waiting 3 seconds for initial load...");
    await new Promise(r => setTimeout(r, 3000));
    
    await page.type('input[placeholder="name@company.com"]', "testcors@kaarya.os");
    await page.type('input[type="password"]', "SecurePass123!");
    await page.type('input[placeholder="Jane Doe"]', "Test User");
    
    // Wait for the button to be ready and click
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Create Account'));
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 5000));
    
    await browser.close();
    console.log("Done.");
})();
