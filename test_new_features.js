const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting visual manual test for new features...");
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 800 },
    slowMo: 50,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
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

  async function clickByText(selector, text) {
      const clicked = await page.evaluate((sel, txt) => {
          const elements = Array.from(document.querySelectorAll(sel));
          const el = elements.find(e => e.textContent.includes(txt));
          if (el) {
              const {x, y, width, height} = el.getBoundingClientRect();
              window.moveFakeCursor(x + width/2, y + height/2);
              window.clickFakeCursor();
              el.click();
              return true;
          }
          return false;
      }, selector, text);
      return clicked;
  }

  try {
    console.log("Logging in as Company...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    await page.type("input[type='email']", "company@test.com", { delay: 50 });
    await page.type("input[type='password']", "password123", { delay: 50 });
    await clickByText('button', 'Sign In');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check Jobs Pipeline
    console.log("Checking Company Job Pipeline...");
    await page.goto('http://localhost:3000/jobs/manage', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await clickByText('button', 'View Pipeline');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check Reels Upload & Comments
    console.log("Checking Reels interactions...");
    await page.goto('http://localhost:3000/reels', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Test Resume Parser
    console.log("Checking Resume Parser workflow...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await clickByText('button', 'Deploy Rit Engine');
    await new Promise(r => setTimeout(r, 4000));
    
    for (let i = 0; i < 4; i++) {
       await clickByText('button', 'Next Integration');
       await new Promise(r => setTimeout(r, 1000));
    }
    await clickByText('button', 'Finalize Portfolio');
    console.log("Finalized Portfolio - expecting redirect to Root.");
    await new Promise(r => setTimeout(r, 3000));
    
    // Feed Network Pulse Fix
    console.log("Checking Feed...");
    await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    console.log("All functional test segments executed.");

  } catch (e) {
    console.error("Test execution error:", e);
  } finally {
    console.log("Closing browser in 5 seconds...");
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
  }
})();
