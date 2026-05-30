const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    console.log("Navigating...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Fill in phone number
    console.log("Testing Phone...");
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        for (let i of inputs) {
            if (i.placeholder.includes('Phone') || i.type === 'tel') {
                i.value = '9315600875';
                i.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    });

    // Click SEND OTP for phone
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (let b of buttons) {
            if (b.innerText.includes('SEND OTP')) {
                b.click();
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 4000));
    
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
