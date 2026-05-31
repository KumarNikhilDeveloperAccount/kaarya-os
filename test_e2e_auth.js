const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser for E2E Auth Test...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    let currentOtp = null;

    page.on('console', msg => {
        if (msg.text().includes('OTP Error') || msg.text().includes('Failed') || msg.text().includes('Error')) {
            console.error('UI ERROR TOAST:', msg.text());
        } else {
            console.log('UI LOG:', msg.text());
        }
    });

    page.on('response', async r => {
        if (r.url().includes('otp/request') && r.status() === 200) {
            try {
                const body = await r.json();
                if (body.debug_code) {
                    currentOtp = body.debug_code;
                    console.log(`[Captured Debug OTP]: ${currentOtp}`);
                }
            } catch(e) {}
        }
    });

    try {
        console.log("Navigating to signup...");
        await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle0', timeout: 30000 });
        
        console.log("Switching to Email OTP tab...");
        await page.click('::-p-text(Email OTP)');
        
        // Wait for the animation to finish and the form to switch
        await new Promise(r => setTimeout(r, 1000));

        console.log("Clearing and typing email...");
        await page.evaluate(() => { 
            const input = document.querySelector('input[placeholder="name@company.com"]');
            if(input) input.value = ''; 
        });
        
        // Use the debug domain so the backend returns the OTP
        const testEmail = `puppeteer.${Date.now()}@kaarya.os`;
        console.log(`Using email: ${testEmail}`);
        await page.type('input[placeholder="name@company.com"]', testEmail);
        
        console.log("Taking screenshot of form...");
        await page.screenshot({ path: 'auth_form.png' });

        console.log("Submitting form...");
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if(form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });

        console.log("Waiting for OTP field to appear...");
        await page.waitForSelector('input[placeholder="6-digit code"]', { timeout: 10000 });

        if (!currentOtp) {
            console.log("Waiting 2s for response interceptor...");
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!currentOtp) throw new Error("Could not capture debug OTP from response!");

        console.log("Typing OTP...");
        await page.type('input[placeholder="6-digit code"]', currentOtp);

        console.log("Submitting Verify form...");
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if(form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });

        console.log("Waiting for redirect to /role-selection or /...");
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        
        console.log("Current URL:", page.url());
        if (page.url().includes('role-selection') || page.url().endsWith('/')) {
            console.log("✅ E2E Auth Test PASSED!");
        } else {
            console.log("❌ E2E Auth Test FAILED: Did not redirect.");
        }

    } catch (e) {
        console.error("Test execution failed:", e);
    } finally {
        await browser.close();
    }
})();
