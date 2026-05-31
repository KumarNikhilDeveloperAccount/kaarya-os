const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser for E2E Profile Test...");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    
    // We need to login first
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    console.log("Switching to Email OTP tab...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tab = buttons.find(b => b.textContent && b.textContent.includes('Email OTP'));
        if (tab) tab.click();
    });

    const testEmail = `puppeteer.profile.${Date.now()}@kaarya.os`;
    console.log(`Setting React state for email to: ${testEmail}`);
    await page.evaluate((email) => {
        const inputs = document.querySelectorAll('input[type="email"]');
        inputs.forEach(input => {
            if (input.placeholder && input.placeholder.includes("name@work.com")) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(input, email);
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
    }, testEmail);

    let currentOtp = null;
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes("OTP created successfully")) {
            console.log("UI LOG:", text);
        }
        if (text.includes("development debug code")) {
            const match = text.match(/code: (\d{6})/);
            if (match) {
                currentOtp = match[1];
                console.log(`[Captured Debug OTP]: ${currentOtp}`);
            }
        }
    });

    console.log("Clicking Send OTP...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const sendBtn = buttons.find(b => b.textContent && b.textContent.includes('Send Secure OTP'));
        if (sendBtn) sendBtn.click();
    });

    console.log("Waiting for OTP field to appear...");
    await page.waitForSelector('input[placeholder="000000"]', { timeout: 10000 });

    if (!currentOtp) {
        console.log("Waiting 2s for response interceptor...");
        await new Promise(r => setTimeout(r, 2000));
    }

    if (!currentOtp) throw new Error("OTP was not captured from console logs!");

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

    console.log("Clicking Verify...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const verifyBtn = buttons.find(b => b.textContent && b.textContent.includes('Verify & Authenticate'));
        if (verifyBtn) verifyBtn.click();
    });

    console.log("Waiting for redirect to /role-selection...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log(`Current URL: ${page.url()}`);
    if (!page.url().includes('/role-selection')) {
        throw new Error("Did not redirect to role selection!");
    }

    // Role Selection
    console.log("Selecting Candidate role...");
    await page.evaluate(() => {
        const h3s = Array.from(document.querySelectorAll('h3'));
        const candidateH3 = h3s.find(h => h.textContent && h.textContent.includes('Candidate'));
        if (candidateH3) candidateH3.closest('button').click();
    });

    console.log("Clicking Confirm Selection...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent && b.textContent.includes('Confirm Selection'));
        if (confirmBtn) confirmBtn.click();
    });

    console.log("Waiting for redirect to /onboarding/candidate...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log(`Current URL: ${page.url()}`);
    
    console.log("Filling out onboarding Step 1...");
    await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        
        const nameInput = inputs.find(i => i.placeholder === 'John Doe');
        if (nameInput) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(nameInput, 'Puppeteer Candidate');
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        const dobInput = inputs.find(i => i.type === 'date');
        if (dobInput) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(dobInput, '1995-01-01');
            dobInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    console.log("Clicking Next...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Next Step'));
        if (nextBtn) nextBtn.click();
    });

    console.log("Waiting 1s...");
    await new Promise(r => setTimeout(r, 1000));

    console.log("Filling out onboarding Step 2...");
    await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        
        // College input is the first text input on this step that isn't name (which is hidden)
        // Let's just find the visible ones
        const visibleInputs = inputs.filter(i => i.getBoundingClientRect().height > 0);
        if (visibleInputs.length > 0) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(visibleInputs[0], 'MIT');
            visibleInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    console.log("Clicking Next...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Next Step'));
        if (nextBtn) nextBtn.click();
    });
    
    console.log("Waiting 1s...");
    await new Promise(r => setTimeout(r, 1000));

    // For step 3 we need to upload a dummy file to the resume file input
    console.log("Uploading dummy resume...");
    const fileInput = await page.$('input[type="file"][accept=".pdf,.doc,.docx"]');
    if (fileInput) {
        // Create a dummy file in the project
        const fs = require('fs');
        fs.writeFileSync('dummy_resume.pdf', 'dummy content');
        await fileInput.uploadFile('dummy_resume.pdf');
    }
    
    console.log("Clicking Complete Profile...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const completeBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Profile'));
        if (completeBtn) completeBtn.click();
    });

    console.log("Waiting for redirect to home...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log(`Current URL: ${page.url()}`);
    console.log("✅ E2E Profile Test PASSED!");
    
    await browser.close();
})();
