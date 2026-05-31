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
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const tabBtn = btns.find(b => b.textContent.includes('Email OTP'));
            if(tabBtn) tabBtn.click();
        });
        
        // Wait for the animation to finish and the form to switch
        await new Promise(r => setTimeout(r, 1000));

        const testEmail = `puppeteer.${Date.now()}@kaarya.os`;
        console.log(`Setting React state for email to: ${testEmail}`);
        
        // Use native setter for React 16+ to trigger onChange correctly
        await page.evaluate((emailValue) => {
            const inputs = document.querySelectorAll('input[type="email"]');
            inputs.forEach(input => {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(input, emailValue);
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            });
            
            const textInputs = document.querySelectorAll('input[type="text"]');
            textInputs.forEach(input => {
                if (input.placeholder && input.placeholder.includes("Jane Doe")) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeInputValueSetter.call(input, "Puppeteer Bot");
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });
        }, testEmail);

        await new Promise(r => setTimeout(r, 500));

        console.log("Clicking Send OTP...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.textContent.includes('Send OTP'));
            if(btn) {
                btn.click();
            }
        });

        console.log("Waiting for OTP field to appear...");
        await page.waitForSelector('input[placeholder="000000"]', { timeout: 10000 });

        if (!currentOtp) {
            console.log("Waiting 2s for response interceptor...");
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!currentOtp) throw new Error("Could not capture debug OTP from response!");

        console.log("Typing OTP...");
        await page.evaluate((otpValue) => {
            const inputs = document.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                if (input.placeholder && input.placeholder.includes("000000")) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeInputValueSetter.call(input, otpValue);
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });
        }, currentOtp);

        await new Promise(r => setTimeout(r, 500));

        console.log("Clicking Verify...");
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
