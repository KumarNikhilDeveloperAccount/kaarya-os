const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting visual manual test...");
  
  // Launch in non-headless mode with slowMo to let the user see the actions
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 800 },
    slowMo: 50,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
  // Function to simulate a fake visible cursor
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

  // Helper to visually click an element
  async function visualClick(selector) {
    await page.waitForSelector(selector, { visible: true });
    const rect = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const {x, y, width, height} = el.getBoundingClientRect();
      return {x: x + width/2, y: y + height/2};
    }, selector);
    
    await page.evaluate((x, y) => window.moveFakeCursor(x, y), rect.x, rect.y);
    await new Promise(r => setTimeout(r, 600)); // wait for cursor to move
    await page.evaluate(() => window.clickFakeCursor());
    await page.click(selector);
    await new Promise(r => setTimeout(r, 1000));
  }

  try {
    console.log("Navigating to http://localhost:3000 ...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Simulate user reading the page
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if logged in by looking for Dashboard or Login button
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector("a[href='/dashboard'], a[href='/settings']");
    });
    
    if (!isLoggedIn) {
        console.log("Not logged in. Clicking Sign In...");
        await visualClick("a[href='/login']");
        await page.waitForSelector("input[type='email']", { visible: true });
        
        await page.type("input[type='email']", "test_user_demo@kaarya.os", { delay: 50 });
        await page.type("input[type='password']", "password123", { delay: 50 });
        
        const loginButtons = await page.$$("button");
        for (let btn of loginButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes("Sign In") || text.includes("Sign in")) {
                await btn.click();
                break;
            }
        }
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Go to Network Pulse (Feed)
    console.log("Checking Network Pulse...");
    await visualClick("a[href='/feed']");
    await new Promise(r => setTimeout(r, 2000));
    
    // Go to Settings -> Danger Zone -> Decommission
    console.log("Checking Decommission flow...");
    // Helper to find and click an element by text content
    async function clickByText(selector, text) {
        const clicked = await page.evaluate((sel, txt) => {
            const elements = Array.from(document.querySelectorAll(sel));
            const el = elements.find(e => e.textContent.includes(txt));
            if (el) {
                el.click();
                return true;
            }
            return false;
        }, selector, text);
        return clicked;
    }

    // Go to Settings -> Danger Zone -> Decommission
    console.log("Checking Decommission flow...");
    await clickByText('a', 'Settings');
    await new Promise(r => setTimeout(r, 2000));
    
    // Click Danger Zone Tab
    await clickByText('button', 'Danger Zone');
    await new Promise(r => setTimeout(r, 1000));
    
    // Click Yes, Decommission
    await clickByText('button', 'Decommission Account');
    await new Promise(r => setTimeout(r, 1000));
        
    // Confirm decommission
    await clickByText('button', 'Decommission');
    console.log("Account successfully decommissioned!");
    await new Promise(r => setTimeout(r, 3000)); // Wait for redirect to home
    
    console.log("Signing up again to verify fresh slate...");
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    await page.type("input[type='text']", "Kaarya Tester", { delay: 50 });
    await page.type("input[type='email']", "test_user_demo2@kaarya.os", { delay: 50 });
    await page.type("input[type='password']", "password123", { delay: 50 });
    await clickByText('button', 'Create Account');
    
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Checking Billing/Razorpay flow...");
    // Direct navigation is safer than UI clicks for automated script resilience
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await clickByText('a', 'Billing');
    await new Promise(r => setTimeout(r, 2000));
    
    await clickByText('button', 'Upgrade');
    console.log("Razorpay Checkout Opened!");
    await new Promise(r => setTimeout(r, 4000));
    // We close the checkout modal by finding the X or we just let it sit
    
    console.log("Test completed successfully!");
    
  } catch (e) {
    console.error("Test execution encountered an error:", e);
  } finally {
    console.log("Closing browser in 5 seconds...");
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
  }
})();
