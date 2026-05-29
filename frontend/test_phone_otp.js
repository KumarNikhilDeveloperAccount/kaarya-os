const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
  
  console.log("Navigated to signup. Clicking Phone OTP tab...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const phoneBtn = buttons.find(b => b.textContent.includes('Phone OTP'));
    if(phoneBtn) phoneBtn.click();
  });

  await page.waitForTimeout(1000);
  
  console.log("Filling form...");
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    if(inputs.length >= 2) {
      inputs[0].value = 'Test User';
      inputs[1].value = '+919315600875';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  console.log("Clicking Send OTP...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sendBtn = buttons.find(b => b.textContent.includes('Send OTP'));
    if(sendBtn) sendBtn.click();
  });

  await page.waitForTimeout(5000);
  console.log("Done waiting.");
  await browser.close();
})();
