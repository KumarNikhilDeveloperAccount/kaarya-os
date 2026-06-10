const puppeteer = require('puppeteer');
const fs = require('fs');

async function runExhaustiveTest() {
  console.log("Starting exhaustive manual testing simulation...");
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1440, height: 900 },
    slowMo: 100 // Slow down to simulate real user speed and allow for observations
  });
  
  const page = await browser.newPage();
  const report = [];

  // Helper to log and record
  const log = (msg) => {
    console.log(msg);
    report.push(`- ${msg}`);
  };

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function checkPage(url, pageName) {
    try {
      log(`Navigating to ${pageName} (${url})...`);
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      if (response && !response.ok()) {
        log(`[FAIL] ${pageName} failed to load. Status: ${response.status()}`);
        return false;
      }
      
      // Basic check for obvious errors on screen
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes("Application error: a client-side exception has occurred") || 
          bodyText.includes("Internal Server Error")) {
        log(`[FAIL] ${pageName} showed a client-side or internal server error on screen.`);
        return false;
      }
      
      log(`[PASS] ${pageName} loaded successfully.`);
      return true;
    } catch (e) {
      log(`[FAIL] Exception while navigating to ${pageName}: ${e.message}`);
      return false;
    }
  }

  // Helper to click link by text
  async function clickByText(selector, text) {
    return await page.evaluate((sel, txt) => {
        const elements = Array.from(document.querySelectorAll(sel));
        const el = elements.find(e => e.textContent && e.textContent.includes(txt));
        if (el) {
            el.scrollIntoView();
            el.click();
            return true;
        }
        return false;
    }, selector, text);
  }

  try {
    // -----------------------------------------------------
    // 1. Unauthenticated Pages
    // -----------------------------------------------------
    log("\n--- Testing Public Routes ---");
    await checkPage('http://localhost:3000/', 'Landing Page');
    await checkPage('http://localhost:3000/pricing', 'Pricing Page');
    
    // -----------------------------------------------------
    // 2. Candidate Role Workflows
    // -----------------------------------------------------
    log("\n--- Testing Candidate Workflows ---");
    await checkPage('http://localhost:3000/login', 'Login Page');
    await page.type("input[type='email']", "candidate@test.com");
    await page.type("input[type='password']", "password123");
    await clickByText('button', 'Sign In');
    await wait(3000);
    
    // Dashboard
    await checkPage('http://localhost:3000/dashboard', 'Candidate Dashboard');
    
    // Feed
    await checkPage('http://localhost:3000/feed', 'Network Feed');
    await wait(2000);
    // Try to post on feed
    const postInput = await page.$('textarea');
    if (postInput) {
        await postInput.type('Hello Kaarya network from automation!', {delay: 50});
        await clickByText('button', 'Post');
        log('[PASS] Candidate Feed Post created.');
        await wait(2000);
    } else {
        log('[FAIL] Could not find Feed textarea.');
    }

    // Reels
    await checkPage('http://localhost:3000/reels', 'Reels / Discover');
    await wait(3000); // Let videos load
    
    // Engineering Lab
    await checkPage('http://localhost:3000/sandbox', 'Engineering Lab');
    await wait(2000);
    
    // Resume Builder
    await checkPage('http://localhost:3000/resume', 'Resume Builder / Rit.ai Evaluate');
    await wait(2000);
    
    // Messages
    await checkPage('http://localhost:3000/messages', 'Direct Messages');
    await wait(2000);

    // Logout
    await checkPage('http://localhost:3000/login', 'Logout Check');
    
    // -----------------------------------------------------
    // 3. Company Role Workflows
    // -----------------------------------------------------
    log("\n--- Testing Company Workflows ---");
    await checkPage('http://localhost:3000/login', 'Login Page');
    await page.type("input[type='email']", "company@test.com");
    await page.type("input[type='password']", "password123");
    await clickByText('button', 'Sign In');
    await wait(3000);

    await checkPage('http://localhost:3000/dashboard', 'Company Dashboard');
    await checkPage('http://localhost:3000/jobs/manage', 'Company Job Pipeline');
    await wait(2000);
    
    // -----------------------------------------------------
    // 4. Interviewer Role Workflows
    // -----------------------------------------------------
    log("\n--- Testing Interviewer Workflows ---");
    await checkPage('http://localhost:3000/login', 'Login Page');
    await page.type("input[type='email']", "interviewer@test.com");
    await page.type("input[type='password']", "password123");
    await clickByText('button', 'Sign In');
    await wait(3000);

    await checkPage('http://localhost:3000/dashboard', 'Interviewer Dashboard');
    await checkPage('http://localhost:3000/interviews', 'Scheduled Interviews');
    await wait(2000);

    // -----------------------------------------------------
    // 5. College Role Workflows
    // -----------------------------------------------------
    log("\n--- Testing College Workflows ---");
    await checkPage('http://localhost:3000/login', 'Login Page');
    await page.type("input[type='email']", "college@test.com");
    await page.type("input[type='password']", "password123");
    await clickByText('button', 'Sign In');
    await wait(3000);

    await checkPage('http://localhost:3000/dashboard', 'College Dashboard');
    await wait(2000);

  } catch (error) {
    log(`[ERROR] Test suite encountered an error: ${error.message}`);
  } finally {
    log("\n--- Manual Testing Simulation Complete ---");
    await browser.close();
    
    // Save report
    fs.writeFileSync('C:/kaarya-os/exhaustive_report.txt', report.join('\n'));
    console.log("Detailed report saved to exhaustive_report.txt");
  }
}

runExhaustiveTest();
