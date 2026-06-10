const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("Starting visual manual test run...");
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Create a dummy image for upload
  const dummyImagePath = path.join(__dirname, 'test_profile.png');
  if (!fs.existsSync(dummyImagePath)) {
    // Write a tiny 1x1 png
    fs.writeFileSync(dummyImagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'));
  }

  // Intercept API responses to get OTP
  let otpPromise = new Promise(resolve => {
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/otp/request') && response.status() === 200) {
        try {
          const body = await response.json();
          if (body.debug_code) {
            console.log(`[Intercepted] OTP Code received: ${body.debug_code}`);
            resolve(body.debug_code);
          }
        } catch (e) {}
      }
    });
  });

  const testEmail = `test_candidate_${Date.now()}@kaarya.os`;

  try {
    console.log("Navigating to Home...");
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);

    console.log("Clicking Login...");
    await page.click('text=Login to Workspace');
    await page.waitForTimeout(1000);

    console.log("Switching to OTP mode...");
    await page.click('button:has-text("Email OTP")');
    await page.waitForTimeout(500);

    console.log(`Entering Email: ${testEmail}`);
    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Request Access Code")');

    console.log("Waiting for OTP UI to appear...");
    await page.waitForSelector('input[type="text"]');
    
    console.log("Waiting for OTP from backend...");
    const currentOtp = await otpPromise;

    console.log("Entering intercepted OTP...");
    await page.fill('input[placeholder="6-digit code"]', currentOtp);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Verify & Enter")');

    console.log("Waiting for Role Selection...");
    await page.waitForSelector('h3:has-text("Candidate")');
    
    console.log("Selecting Candidate Role...");
    await page.click('h3:has-text("Candidate")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Confirm Selection")');

    console.log("Waiting for Candidate Onboarding...");
    await page.waitForSelector('input#fullName');

    console.log("Filling Step 1...");
    await page.fill('input#fullName', 'Jane QA Engineer');
    await page.fill('input#dob', '1995-05-15');
    await page.fill('input#location', 'San Francisco, CA');
    
    console.log("Uploading test profile picture...");
    await page.setInputFiles('input[type="file"][accept="image/*"]', dummyImagePath);
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Next Step")');

    console.log("Filling Step 2...");
    await page.waitForTimeout(500);
    await page.click('button:has-text("Working Professional")');
    // We need to wait for input to be available but since they are rendered, it's fine
    const collegeInputs = await page.$$('input[type="text"]');
    await collegeInputs[0].fill('Stanford University'); // College
    await collegeInputs[1].fill('B.S. Computer Science'); // Degree
    await page.click('button:has-text("Next Step")');

    console.log("Filling Step 3...");
    await page.waitForTimeout(500);
    const dummyPdfPath = path.join(__dirname, 'test_resume.pdf');
    if (!fs.existsSync(dummyPdfPath)) fs.writeFileSync(dummyPdfPath, 'Dummy PDF content');
    await page.setInputFiles('input#resume-upload', dummyPdfPath);
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Next Step")');

    console.log("Filling Step 4...");
    await page.waitForTimeout(500);
    await page.selectOption('select', 'fulltime'); // Employment Type
    await page.click('button:has-text("Next Step")');

    console.log("Filling Step 5...");
    await page.waitForTimeout(500);
    await page.click('button:has-text("Complete Profile")');

    console.log("Waiting for Dashboard...");
    await page.waitForSelector('text=Network Feed', { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log("Navigating to Network Feed...");
    await page.click('text=Network Feed');
    await page.waitForTimeout(1500);
    
    console.log("Navigating to Messages...");
    await page.click('text=Messages');
    await page.waitForTimeout(1500);

    console.log("Visual Test completed successfully. Closing in 3 seconds...");
    await page.waitForTimeout(3000);
  } catch (error) {
    console.error("Test encountered an error:", error);
  } finally {
    await browser.close();
    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath);
    }
  }
})();
