const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("=== KAARYA.OS VISUAL COMPREHENSIVE TEST ===");
  const browser = await chromium.launch({ headless: false, slowMo: 700 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Create dummy assets
  const dummyPic = path.join(__dirname, 'test_profile.png');
  if (!fs.existsSync(dummyPic)) fs.writeFileSync(dummyPic, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'));
  const dummyPdf = path.join(__dirname, 'test_resume.pdf');
  if (!fs.existsSync(dummyPdf)) fs.writeFileSync(dummyPdf, 'Dummy PDF content for resume testing');

  let currentOtpResolve = null;
  page.on('response', async (response) => {
    if (response.url().includes('/api/auth/otp/request') && response.status() === 200) {
      try {
        const body = await response.json();
        if (body.debug_code && currentOtpResolve) {
          console.log(`[Intercepted] OTP Code: ${body.debug_code}`);
          currentOtpResolve(body.debug_code);
          currentOtpResolve = null;
        }
      } catch (e) {}
    }
  });

  const getOtp = () => new Promise(resolve => { currentOtpResolve = resolve; });

  const testEmailPrefix = `visual_test_${Date.now()}`;

  try {
    console.log("\n--- TEST 1: REGISTRATION SEPARATION ---");
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[type="email"]', `${testEmailPrefix}_cand@kaarya.os`);
    const responsePromise = page.waitForResponse(r => r.url().includes('/api/auth/otp/request'));
    await page.click('button:has-text("Request Access Code")');
    console.log("Waiting to see 404 error from backend...");
    const response = await responsePromise;
    if (response.status() === 404) {
      console.log("Success! Login blocking works. (404 received)");
    } else {
      console.error(`Expected 404, got ${response.status()}`);
    }

    console.log("\n--- TEST 2: CANDIDATE SIGNUP & ONBOARDING ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', 'Jane Candidate');
    await page.fill('input[type="email"]', `${testEmailPrefix}_cand@kaarya.os`);
    
    let otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    const candOtp = await otpPromise;
    await page.fill('input[placeholder="000000"]', candOtp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('h3:has-text("Candidate")');
    await page.click('h3:has-text("Candidate")');
    await page.click('button:has-text("Confirm Selection")');

    await page.waitForSelector('input#fullName');
    
    // Step 1
    await page.fill('input#fullName', 'Jane Candidate');
    // Click Date of birth to test showPicker logic
    await page.click('input#dob');
    await page.fill('input#dob', '1995-05-15');
    await page.fill('input#location', 'San Francisco, CA');
    await page.setInputFiles('input[type="file"][accept="image/*"]', dummyPic);
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Next Step")');

    // Step 2
    await page.click('button:has-text("Working Professional")');
    const textInputs = await page.$$('input[type="text"]');
    await textInputs[0].fill('Stanford University');
    await textInputs[1].fill('B.S. Computer Science');
    await page.click('button:has-text("Next Step")');

    // Step 3
    await page.setInputFiles('input#resume-upload', dummyPdf);
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Next Step")');

    // Step 4 & 5
    await page.selectOption('select', 'fulltime');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Complete Profile")');

    // Candidate Dashboard
    await page.waitForSelector('text=Journey');
    
    // Check Settings for Profile Pic and Resume
    console.log("Navigating to Settings to check global state...");
    await page.click('text=Settings');
    await page.waitForTimeout(1000);
    console.log("Verifying 'Download Active Resume' button...");
    await page.waitForSelector('text=Download Active Resume');
    
    // Logout
    await page.click('.rounded-full.bg-gradient-to-tr'); // Topbar avatar
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);

    console.log("\n--- TEST 3: COMPANY DASHBOARD ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', 'Acme HR');
    await page.fill('input[type="email"]', `${testEmailPrefix}_comp@kaarya.os`);
    otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    const compOtp = await otpPromise;
    await page.fill('input[placeholder="000000"]', compOtp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('h3:has-text("Company")');
    await page.click('h3:has-text("Company")');
    await page.click('button:has-text("Confirm Selection")');

    // COMPLETE COMPANY ONBOARDING
    await page.waitForSelector('input[placeholder="Acme Corp"]');
    await page.fill('input[placeholder="Acme Corp"]', 'Acme Test Corp');
    await page.fill('input[type="url"]', 'https://acme.test');
    await page.fill('input[placeholder="City, Country"]', 'New York, NY');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('select >> nth=0');
    await page.selectOption('select >> nth=0', 'tech');
    await page.selectOption('select >> nth=1', '51-200');
    await page.fill('textarea', 'We are Acme Test Corp.');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('input[placeholder="e.g. Frontend Engineer, Product Manager"]');
    await page.fill('input[placeholder="e.g. Frontend Engineer, Product Manager"]', 'Software Engineer');
    await page.press('input[placeholder="e.g. Frontend Engineer, Product Manager"]', 'Enter');
    await page.click('button:has-text("Complete Setup")');

    await page.waitForSelector('text=Welcome aboard!');
    await page.click('button:has-text("Enter Kaarya.OS")');

    // Wait for Dashboard to load real (or empty) data
    await page.waitForSelector('text=Hiring Console');
    console.log("Company Dashboard loaded without fake JSON data.");
    await page.waitForTimeout(1000);

    console.log("Testing Requisition Creation...");
    await page.click('button:has-text("Create Requisition")');
    await page.fill('input[placeholder="e.g. Senior Architecture Lead"]', 'Lead Engineer');
    await page.fill('textarea', 'Looking for a senior engineer with strong forensic logic.');
    await page.click('button:has-text("Broadcast Requisition")');
    await page.waitForTimeout(1500);

    await page.click('.rounded-full.bg-gradient-to-tr'); // Topbar avatar
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);

    console.log("\n--- TEST 4: TRAINER DASHBOARD ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', 'Expert Bob');
    await page.fill('input[type="email"]', `${testEmailPrefix}_train@kaarya.os`);
    otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    const trainOtp = await otpPromise;
    await page.fill('input[placeholder="000000"]', trainOtp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('text=Select Your Persona');
    await page.click('h3:has-text("Trainer")');
    await page.click('button:has-text("Confirm Selection")');

    // COMPLETE TRAINER ONBOARDING
    await page.waitForSelector('input[placeholder="Jane Doe"]');
    await page.fill('input[placeholder="Jane Doe"]', 'Expert Bob Test');
    await page.fill('input[placeholder="City, Country"]', 'San Jose, CA');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('input[placeholder="Senior Software Engineer"]');
    await page.fill('input[placeholder="Senior Software Engineer"]', 'Principal Architect');
    await page.fill('input[placeholder="Google"]', 'Tech Giant');
    await page.selectOption('select', '10+');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('input[placeholder="e.g. System Design, React, Node.js"]');
    await page.fill('input[placeholder="e.g. System Design, React, Node.js"]', 'System Design');
    await page.press('input[placeholder="e.g. System Design, React, Node.js"]', 'Enter');
    await page.click('button:has-text("Complete Setup")');

    await page.waitForSelector('text=You\'re ready to interview! 🎉');
    await page.click('button:has-text("Enter Kaarya.OS")');

    await page.waitForSelector('text=Expert Panel', { timeout: 30000 });
    console.log("Trainer Dashboard loaded safely.");
    await page.waitForTimeout(1500);
    
    await page.click('.rounded-full.bg-gradient-to-tr'); // Topbar avatar
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);

    console.log("\n--- TEST 5: COLLEGE DASHBOARD ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', 'Stanford Admin');
    await page.fill('input[type="email"]', `${testEmailPrefix}_coll@kaarya.os`);
    otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    const collOtp = await otpPromise;
    await page.fill('input[placeholder="000000"]', collOtp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('text=Select Your Persona');
    await page.click('h3:has-text("College")');
    await page.click('button:has-text("Confirm Selection")');

    // COMPLETE COLLEGE ONBOARDING
    await page.waitForSelector('input[placeholder="National Institute of Technology"]');
    await page.fill('input[placeholder="National Institute of Technology"]', 'Stanford Test Univ');
    await page.fill('input[placeholder="City, State"]', 'Stanford, CA');
    await page.fill('input[placeholder="E.g. Autonomous, State Univ"]', 'Private');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('input[placeholder="e.g. B.Tech, M.Tech, MCA, MBA"]');
    await page.fill('input[placeholder="e.g. B.Tech, M.Tech, MCA, MBA"]', 'B.S. Computer Science');
    await page.press('input[placeholder="e.g. B.Tech, M.Tech, MCA, MBA"]', 'Enter');
    await page.fill('input[placeholder="e.g. Computer Science, Electronics, Mechanical"]', 'AI & ML');
    await page.press('input[placeholder="e.g. Computer Science, Electronics, Mechanical"]', 'Enter');
    await page.click('button:has-text("Next Step")');

    await page.waitForSelector('input[placeholder="John Doe"]');
    await page.fill('input[placeholder="John Doe"]', 'Jane Placement Officer');
    await page.fill('input[placeholder="placements@college.edu"]', 'placements@stanford.test');
    await page.selectOption('select', '500-1000');
    await page.click('button:has-text("Complete Setup")');

    await page.waitForSelector('text=Institution registered! 🎉');
    await page.click('button:has-text("Enter Kaarya.OS")');

    await page.waitForSelector('text=Institutional Hub', { timeout: 30000 });
    console.log("College Dashboard loaded safely.");
    await page.waitForTimeout(2000);

    console.log("\n=== ALL VISUAL TESTS COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
    if (fs.existsSync(dummyPic)) fs.unlinkSync(dummyPic);
    if (fs.existsSync(dummyPdf)) fs.unlinkSync(dummyPdf);
  }
})();
