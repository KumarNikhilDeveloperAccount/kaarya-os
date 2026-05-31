const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Log all toasts
    page.on('console', msg => {
        if (msg.text().includes('OTP Error') || msg.text().includes('Failed') || msg.text().includes('Error')) {
            console.log('UI ERROR TOAST LOGGED:', msg.text());
        }
    });

    console.log("Navigating to signup...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'domcontentloaded' });
    
    // Check what the actual API base URL is
    const apiBaseUrl = await page.evaluate(() => {
        // Look for any scripts that contain process.env.NEXT_PUBLIC_API_BASE_URL
        return window.__NEXT_DATA__?.env?.NEXT_PUBLIC_API_BASE_URL || 'Not found in NEXT_DATA';
    });
    console.log("API Base URL in frontend:", apiBaseUrl);

    console.log("Typing email...");
    // Clear first
    await page.evaluate(() => { document.querySelector('input[placeholder="name@company.com"]').value = ''; });
    await page.type('input[placeholder="name@company.com"]', "puppeteer.live.test@kaarya.os");
    
    console.log("Clicking Send OTP...");
    await page.evaluate(() => {
        const form = document.querySelector('form');
        const btn = form.querySelector('button[type="submit"]');
        btn.click();
    });
    
    // Let's see if there are any network requests
    page.on('request', r => {
        if (r.url().includes('otp')) console.log("REQ:", r.method(), r.url());
    });
    page.on('response', async r => {
        if (r.url().includes('otp')) console.log("RES:", r.status(), await r.text().catch(e=>'no body'));
    });

    await new Promise(r => setTimeout(r, 5000));
    
    // Does a toast appear?
    const html = await page.content();
    if (html.includes('OTP Error')) {
        console.log("FOUND OTP ERROR IN HTML!");
    } else if (html.includes('Send OTP Error')) {
        console.log("FOUND SEND OTP ERROR IN HTML!");
    } else {
        console.log("No error toast found.");
    }
    
    await browser.close();
    console.log("Done.");
})();
