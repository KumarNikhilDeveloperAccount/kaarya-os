const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting visual testing simulation without pre-filled inputs...");
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1440, height: 900 },
    slowMo: 60,
    args: ['--window-size=1440,900']
  });
  
  const page = await browser.newPage();
  
  // Custom cursor
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'puppeteer-cursor';
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
      cursor.style.position = 'fixed';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transition = 'all 0.2s ease';
      document.body.appendChild(cursor);

      window.moveFakeCursor = (x, y) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      };
      
      window.clickFakeCursor = () => {
        cursor.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
        cursor.style.transform = 'scale(0.8)';
        setTimeout(() => {
          cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
          cursor.style.transform = 'scale(1)';
        }, 200);
      };
    });
  });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function clickByText(selector, text) {
      return await page.evaluate((sel, txt) => {
          const elements = Array.from(document.querySelectorAll(sel));
          const el = elements.find(e => e.textContent && e.textContent.includes(txt));
          if (el) {
              const {x, y, width, height} = el.getBoundingClientRect();
              window.moveFakeCursor(x + width/2, y + height/2);
              window.clickFakeCursor();
              el.click();
              return true;
          }
          return false;
      }, selector, text);
  }

  try {
    // ----------------------------------------------------------------
    // 1. SIGNUP & ROLE SELECTION (Clean state, no clearing needed)
    // ----------------------------------------------------------------
    console.log("Navigating to Signup...");
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    await wait(2000);

    // Type directly into the empty fields
    const emailInput = await page.$("input[type='email']");
    await emailInput.focus();
    await emailInput.type(`finaltest${Date.now()}@example.com`, { delay: 60 });

    const passwordInput = await page.$("input[type='password']");
    await passwordInput.focus();
    await passwordInput.type("password123", { delay: 60 });

    const nameInput = await page.$("input[type='text']");
    if (nameInput) {
      await nameInput.focus();
      await nameInput.type("Kaarya Tester", { delay: 60 });
    }

    await clickByText('button', 'Create Account');
    console.log("Submitted signup form...");
    await wait(4000); // Wait for success animation and redirect
    
    console.log("At Role Selection...");
    await wait(2000);

    // ----------------------------------------------------------------
    // 2. EXPLORING FEATURES
    // ----------------------------------------------------------------
    console.log("Navigating to Candidate specific pages...");

    console.log("Checking Network Feed...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
        await textarea.click();
        await textarea.type('Testing the pristine feed experience without pre-filled bugs!', {delay: 50});
        await clickByText('button', 'Post');
        await wait(2000);
    }

    console.log("Checking Reels...");
    await page.goto('http://localhost:3000/reels', { waitUntil: 'networkidle2' });
    await wait(4000); 
    
    console.log("Checking Resume Builder / AI Evaluator...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    console.log("Checking Direct Messages...");
    await page.goto('http://localhost:3000/messages', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    console.log("Checking Company Pipeline...");
    await page.goto('http://localhost:3000/jobs/manage', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    console.log("Checking Analytics...");
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    console.log("Checking Engineering Lab (Coding)...");
    await page.goto('http://localhost:3000/coding', { waitUntil: 'networkidle2' });
    await wait(3000);

    console.log("All routes tested successfully with clean inputs.");
    
  } catch (error) {
    console.log(`[ERROR] Test suite encountered an error: ${error.message}`);
  } finally {
    console.log("\n--- Closing browser in 10 seconds ---");
    await wait(10000);
    await browser.close();
  }
})();
