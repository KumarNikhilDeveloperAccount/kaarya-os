const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log("Starting ULTIMATE visual testing simulation...");
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1440, height: 900 },
    slowMo: 80, // Very slow so the user can see everything clearly
    args: ['--window-size=1440,900']
  });
  
  const page = await browser.newPage();
  
  // Custom visual cursor
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'puppeteer-cursor';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
      cursor.style.position = 'fixed';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transition = 'all 0.3s ease';
      document.body.appendChild(cursor);

      window.moveFakeCursor = (x, y) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      };
      
      window.clickFakeCursor = () => {
        cursor.style.backgroundColor = 'rgba(0, 255, 0, 0.9)';
        cursor.style.transform = 'scale(0.7)';
        setTimeout(() => {
          cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
          cursor.style.transform = 'scale(1)';
        }, 300);
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

  async function visuallyClick(selector) {
      const el = await page.$(selector);
      if (el) {
          const box = await el.boundingBox();
          if (box) {
              await page.evaluate((x, y) => window.moveFakeCursor(x, y), box.x + box.width/2, box.y + box.height/2);
              await wait(400);
              await page.evaluate(() => window.clickFakeCursor());
              await el.click();
              return true;
          }
      }
      return false;
  }

  try {
    // ----------------------------------------------------------------
    // PHASE 1: CANDIDATE
    // ----------------------------------------------------------------
    console.log("=== PHASE 1: Candidate Workflow ===");
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    await wait(2000);

    const emailInput = await page.$("input[type='email']");
    await emailInput.focus();
    await emailInput.type(`ultimate_candidate_${Date.now()}@test.com`, { delay: 60 });

    const passwordInput = await page.$("input[type='password']");
    await passwordInput.focus();
    await passwordInput.type("password123", { delay: 60 });

    const nameInput = await page.$("input[type='text']");
    if (nameInput) {
      await nameInput.focus();
      await nameInput.type("Candidate Tester", { delay: 60 });
    }

    await clickByText('button', 'Create Account');
    await wait(4000); 
    
    // --- Network Feed ---
    console.log("Testing Feed Interaction...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle2' });
    await wait(3000);
    const textarea = await page.$('textarea');
    if (textarea) {
        await visuallyClick('textarea');
        await textarea.type('This is a real automated test post! The platform is looking great.', {delay: 50});
        await wait(1000);
        await clickByText('button', 'Post');
        await wait(3000);
    }

    // --- Engineering Lab ---
    console.log("Testing Engineering Lab...");
    await page.goto('http://localhost:3000/coding', { waitUntil: 'networkidle2' });
    await wait(3000);
    
    // Select Python
    await clickByText('button', 'Python');
    await wait(2000);
    
    // Type in editor (assuming we can find a text area or contenteditable)
    const editor = await page.$('.monaco-editor, textarea, [contenteditable="true"]');
    if (editor) {
        await visuallyClick('.monaco-editor, textarea, [contenteditable="true"]');
        // We just click run to compile the default snippet
        await clickByText('button', 'Run');
        await wait(3000);
    }

    // --- Resume Builder ---
    console.log("Testing Resume Evaluator...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle2' });
    await wait(3000);
    const fileInput = await page.$("input[type='file']");
    if (fileInput) {
        await fileInput.uploadFile(path.resolve('./dummy_resume.txt'));
        console.log("Uploaded dummy resume...");
        await wait(2000);
        await clickByText('button', 'Evaluate');
        await wait(4000);
    }

    // --- Messages ---
    console.log("Testing Messaging...");
    await page.goto('http://localhost:3000/messages', { waitUntil: 'networkidle2' });
    await wait(3000);
    const msgInput = await page.$("input[placeholder*='message'], textarea[placeholder*='message']");
    if (msgInput) {
        await visuallyClick("input[placeholder*='message'], textarea[placeholder*='message']");
        await msgInput.type("Hello from the candidate!", {delay: 60});
        await page.keyboard.press('Enter');
        await wait(2000);
    }

    // ----------------------------------------------------------------
    // PHASE 2: COMPANY
    // ----------------------------------------------------------------
    console.log("=== PHASE 2: Company Workflow ===");
    // Force logout (simulated by clearing localstorage and going to login)
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    await wait(2000);

    const emailInput2 = await page.$("input[type='email']");
    await emailInput2.focus();
    await emailInput2.type(`ultimate_company_${Date.now()}@test.com`, { delay: 60 });

    const passwordInput2 = await page.$("input[type='password']");
    await passwordInput2.focus();
    await passwordInput2.type("password123", { delay: 60 });

    const nameInput2 = await page.$("input[type='text']");
    if (nameInput2) {
      await nameInput2.focus();
      await nameInput2.type("Acme Corp", { delay: 60 });
    }

    await clickByText('button', 'Create Account');
    await wait(4000);

    // --- Analytics ---
    console.log("Testing Analytics Dashboard...");
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' });
    await wait(4000);

    // --- Job Pipeline ---
    console.log("Testing Job Pipeline...");
    await page.goto('http://localhost:3000/jobs/manage', { waitUntil: 'networkidle2' });
    await wait(4000);
    await clickByText('button', 'Post New Job');
    await wait(2000);

    console.log("All deep interactive tests completed.");
    
  } catch (error) {
    console.log(`[ERROR] Test suite encountered an error: ${error.message}`);
  } finally {
    console.log("\n--- Closing browser in 10 seconds ---");
    await wait(10000);
    await browser.close();
  }
})();
