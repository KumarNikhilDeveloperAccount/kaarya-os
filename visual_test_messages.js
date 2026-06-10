const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

(async () => {
  console.log("=== KAARYA.OS MESSAGING & REMINDER TEST ===");
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Create dummy image
  const dummyPic = path.join(__dirname, 'test_profile.png');
  if (!fs.existsSync(dummyPic)) fs.writeFileSync(dummyPic, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'));

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
      if(response.url().includes('/users/search')) {
          console.log(`Search Response [${response.status()}]:`, response.url());
          response.json().then(j => console.log('Search Data:', j)).catch(e=>{});
      }
  });

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
  const testEmailPrefix = `msg_test_${Date.now()}`;
  const candidateName = `Msg Cand ${Date.now()}`;

  try {
    // 1. REGISTER CANDIDATE
    console.log("\n--- PART 1: REGISTERING CANDIDATE ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', candidateName);
    await page.fill('input[type="email"]', `${testEmailPrefix}_cand@kaarya.os`);
    let otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    let otp = await otpPromise;
    await page.fill('input[placeholder="000000"]', otp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('h3:has-text("Candidate")');
    await page.click('h3:has-text("Candidate")');
    await page.click('button:has-text("Confirm Selection")');

    // Onboard fast
    await page.waitForSelector('input#fullName');
    await page.fill('input#fullName', candidateName);
    await page.click('input#dob');
    await page.fill('input#dob', '1995-05-15');
    await page.fill('input#location', 'NY');
    await page.setInputFiles('input[type="file"][accept="image/*"]', dummyPic);
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Next Step")');
    
    await page.waitForSelector('button:has-text("Working Professional")');
    await page.click('button:has-text("Working Professional")');
    const textInputs = await page.$$('input[type="text"]');
    await textInputs[0].fill('Stanford University');
    await textInputs[1].fill('B.S. Computer Science');
    await page.click('button:has-text("Next Step")');

    await page.waitForTimeout(1000);
    const dummyPdf = path.join(__dirname, 'test_resume.pdf');
    if (!fs.existsSync(dummyPdf)) fs.writeFileSync(dummyPdf, 'Dummy PDF');
    await page.setInputFiles('input#resume-upload', dummyPdf);
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Next Step")');
    
    await page.waitForSelector('select');
    await page.selectOption('select', 'fulltime');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Complete Profile")');
    await page.waitForSelector('text=Journey');

    // Logout
    await page.click('.rounded-full.bg-gradient-to-tr');
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);

    // 2. REGISTER COMPANY & SEND MESSAGE
    console.log("\n--- PART 2: COMPANY SENDS MESSAGE TO CANDIDATE ---");
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[placeholder="Jane Doe"]', 'Msg Corp');
    await page.fill('input[type="email"]', `${testEmailPrefix}_comp@kaarya.os`);
    otpPromise = getOtp();
    await page.click('button:has-text("Send OTP")');
    otp = await otpPromise;
    await page.fill('input[placeholder="000000"]', otp);
    await page.click('button:has-text("Verify OTP")');

    await page.waitForSelector('h3:has-text("Company")');
    await page.click('h3:has-text("Company")');
    await page.click('button:has-text("Confirm Selection")');

    // Onboard fast
    await page.waitForSelector('input[placeholder="Acme Corp"]');
    await page.fill('input[placeholder="Acme Corp"]', 'Msg Corp');
    await page.fill('input[type="url"]', 'https://msg.test');
    await page.fill('input[placeholder="City, Country"]', 'NY');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Next Step")');
    await page.waitForSelector('select >> nth=0');
    await page.selectOption('select >> nth=0', 'tech');
    await page.selectOption('select >> nth=1', '51-200');
    await page.fill('textarea', 'Feature test corp description.');
    await page.click('button:has-text("Next Step")');
    await page.waitForSelector('input[placeholder="e.g. Frontend Engineer, Product Manager"]');
    await page.fill('input[placeholder="e.g. Frontend Engineer, Product Manager"]', 'DevOps');
    await page.press('input[placeholder="e.g. Frontend Engineer, Product Manager"]', 'Enter');
    await page.click('button:has-text("Complete Setup")');
    await page.waitForSelector('text=Welcome aboard!');
    await page.click('button:has-text("Enter Kaarya.OS")');

    // Go to messages
    await page.goto('http://localhost:3000/messages');
    await page.waitForSelector('text=Inbox');
    
    // Test the new Search Overlay
    console.log("Opening Global Directory Search...");
    await page.click('button:has-text("Find Connections")');
    await page.waitForSelector('input[placeholder="Search network..."]');
    await page.fill('input[placeholder="Search network..."]', candidateName);
    
    // Wait for the result to show up and click it
    await page.waitForSelector(`h4:has-text("${candidateName}")`);
    await page.click(`h4:has-text("${candidateName}")`);
    
    // Now we are in a chat with the candidate! Send message
    await page.waitForSelector(`h2:has-text("${candidateName}")`);
    const messageContent = "Hello! We saw your profile and want to interview you.";
    await page.fill(`input[placeholder="Message ${candidateName}..."]`, messageContent);
    await page.press(`input[placeholder="Message ${candidateName}..."]`, 'Enter');
    
    // Wait for message to appear in UI
    await page.waitForSelector(`text=${messageContent}`);
    console.log("Message successfully sent to a previously uncontacted user!");
    
    // Logout
    await page.click('.rounded-full.bg-gradient-to-tr');
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);


    // 3. TRIGGER REMINDER
    console.log("\n--- PART 3: TRIGGERING UNREAD REMINDERS ---");
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/api/ecosystem/messages/trigger-reminders',
        method: 'POST'
    };
    
    await new Promise((resolve) => {
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log("Reminders Response:", data);
                resolve();
            });
        });
        req.end();
    });

    // 4. CANDIDATE LOGS IN TO READ
    console.log("\n--- PART 4: CANDIDATE READS MESSAGE ---");
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Email OTP")');
    await page.fill('input[type="email"]', `${testEmailPrefix}_cand@kaarya.os`);
    otpPromise = getOtp();
    await page.click('button:has-text("Request Access Code")');
    otp = await otpPromise;
    await page.fill('input[placeholder="6-digit code"]', otp);
    await page.click('button:has-text("Verify & Enter")');

    await page.waitForSelector('text=Journey');
    
    // Go to messages
    await page.goto('http://localhost:3000/messages');
    await page.waitForSelector('text=Inbox');
    
    // Verify unread badge exists (the red circle)
    await page.waitForSelector('div.w-5.h-5.rounded-full.bg-primary');
    console.log("Unread badge successfully verified on candidate side!");

    // Click the thread to read it
    await page.click('h3:has-text("Msg Corp")');
    await page.waitForSelector(`text=${messageContent}`);
    console.log("Message read successfully! Read status updated in backend.");

    console.log("\n=== MESSAGING TEST COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Test failed:", error);
    try {
        await page.screenshot({ path: 'test_failure.png' });
        console.log("Screenshot saved to test_failure.png");
    } catch (e) {}
  } finally {
    await browser.close();
    if (fs.existsSync(dummyPic)) fs.unlinkSync(dummyPic);
    if (fs.existsSync('test_resume.pdf')) fs.unlinkSync('test_resume.pdf');
  }
})();
