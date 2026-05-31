const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Log all network requests and responses
    page.on('request', request => {
        if (request.url().includes('/api/auth')) {
            console.log('>>', request.method(), request.url(), request.postData());
        }
    });
    
    page.on('response', async response => {
        if (response.url().includes('/api/auth')) {
            console.log('<<', response.status(), response.url());
            try {
                const text = await response.text();
                console.log('   Body:', text);
            } catch(e) {}
        }
    });

    console.log("Navigating...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle2' });
    
    console.log("Filling email for OTP request...");
    await page.type('input[placeholder="name@company.com"]', "puppeteer_test_77@kaarya.os");
    
    console.log("Clicking Google Sign-In...");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('Google Sign-In'));
        if (btn) btn.click();
    });
    
    console.log("Waiting for network responses...");
    await new Promise(r => setTimeout(r, 8000));
    
    await browser.close();
    console.log("Done.");
})();
