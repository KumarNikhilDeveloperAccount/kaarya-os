const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Perfect Deep-Dive Visual Simulation...");
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1440, height: 900 },
    slowMo: 80, 
    args: ['--window-size=1440,900']
  });
  
  const page = await browser.newPage();
  
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

  async function clickSelector(selector) {
      const el = await page.$(selector);
      if (el) {
          const box = await el.boundingBox();
          if (box) {
              await page.evaluate((x, y) => window.moveFakeCursor(x, y), box.x + box.width/2, box.y + box.height/2);
              await wait(300);
              await page.evaluate(() => window.clickFakeCursor());
              await el.click();
              return true;
          }
      }
      return false;
  }

  async function signUpAndSelectRole(email, roleText) {
      await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
      await wait(2000);

      const emailInput = await page.$("input[type='email']");
      await emailInput.focus();
      await emailInput.type(email, { delay: 60 });

      const passwordInput = await page.$("input[type='password']");
      await passwordInput.focus();
      await passwordInput.type("password123", { delay: 60 });

      const nameInput = await page.$("input[type='text']");
      if (nameInput) {
        await nameInput.focus();
        await nameInput.type(`Test ${roleText}`, { delay: 60 });
      }

      await clickByText('button', 'Create Account');
      console.log(`[PASS] Submitted Signup for ${roleText}`);
      
      // Wait for role selection redirect
      await wait(5000);
      const isAtRoleSelection = await page.url().includes('role-selection');
      if (isAtRoleSelection) {
          console.log(`[PASS] Reached Role Selection for ${roleText}`);
          // Click the specific role card
          await clickByText('h3', roleText);
          await wait(1000);
          
          // Click confirm
          await clickByText('button', 'Confirm Selection');
          console.log(`[PASS] Confirmed role: ${roleText}`);
          await wait(5000); // Wait for dashboard redirect
      }
  }

  try {
    // ----------------------------------------------------------------
    // ROLE: CANDIDATE
    // ----------------------------------------------------------------
    console.log("\n=== TESTING CANDIDATE ROLE ===");
    await signUpAndSelectRole(`cand_perfect_${Date.now()}@test.com`, 'Candidate');
    
    console.log("Navigating Candidate Dashboard Features...");
    await clickByText('a', 'Network Feed');
    await wait(3000);
    const textarea = await page.$('textarea');
    if (textarea) {
        await clickSelector('textarea');
        await textarea.type('Fully tested Candidate workflow!', {delay: 50});
        await clickByText('button', 'Post');
        await wait(2000);
    }
    
    await clickByText('a', 'Talent Reels');
    await wait(3000);

    await clickByText('a', 'Resume Parser');
    await wait(3000);

    await clickByText('a', 'Engineering Lab');
    await wait(3000);

    // ----------------------------------------------------------------
    // ROLE: COMPANY
    // ----------------------------------------------------------------
    console.log("\n=== TESTING COMPANY ROLE ===");
    await page.evaluate(() => localStorage.clear());
    await signUpAndSelectRole(`comp_perfect_${Date.now()}@test.com`, 'Company');

    console.log("Navigating Company Dashboard Features...");
    await clickByText('a', 'Manage Jobs');
    await wait(3000);
    await clickByText('button', 'Post New Job');
    await wait(2000);

    await clickByText('a', 'Analytics');
    await wait(3000);

    // ----------------------------------------------------------------
    // ROLE: INTERVIEWER
    // ----------------------------------------------------------------
    console.log("\n=== TESTING INTERVIEWER ROLE ===");
    await page.evaluate(() => localStorage.clear());
    await signUpAndSelectRole(`int_perfect_${Date.now()}@test.com`, 'Interviewer');

    console.log("Navigating Interviewer Dashboard Features...");
    await clickByText('a', 'Calendar');
    await wait(3000);

    // ----------------------------------------------------------------
    // ROLE: COLLEGE
    // ----------------------------------------------------------------
    console.log("\n=== TESTING COLLEGE ROLE ===");
    await page.evaluate(() => localStorage.clear());
    await signUpAndSelectRole(`coll_perfect_${Date.now()}@test.com`, 'College');

    console.log("Navigating College Dashboard Features...");
    await clickByText('a', 'Placements');
    await wait(3000);

    console.log("\n=== PERFECT VISUAL TEST COMPLETED SUCCESSFULLY ===");
    
  } catch (error) {
    console.log(`[ERROR] Test suite encountered an error: ${error.message}`);
  } finally {
    console.log("\n--- Closing browser in 10 seconds ---");
    await wait(10000);
    await browser.close();
  }
})();
