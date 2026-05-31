const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log("Navigating to https://kaarya-os.vercel.app/signup ...");
    await page.goto('https://kaarya-os.vercel.app/signup', { waitUntil: 'networkidle2' });
    
    console.log("Waiting for load...");
    await new Promise(r => setTimeout(r, 2000));
    
    const testEmail = `puppeteer_real_e2e_${Date.now()}@kaarya.os`;
    console.log("Using email:", testEmail);
    
    // Clear the email field and type the new one
    await page.evaluate(() => {
        const input = document.querySelector('input[placeholder="name@company.com"]');
        if (input) {
            input.value = '';
        }
    });
    await page.type('input[placeholder="name@company.com"]', testEmail);
    
    console.log("Clicking Send OTP...");
    await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn && btn.textContent.includes('Send OTP')) {
                btn.click();
            }
        }
    });
    
    console.log("Waiting 3 seconds for backend to process OTP...");
    await new Promise(r => setTimeout(r, 3000));
    
    // Fetch the OTP from the Render backend directly via the debug API or Database
    // Actually, I can just use a python snippet to read the SQLite DB!
    console.log("Fetching OTP from database...");
    const getOtpScript = `
import sys
from backend.app.database import SessionLocal
from backend.app.models import User
db = SessionLocal()
user = db.query(User).filter(User.email == "${testEmail}").first()
if user and user.otp_code:
    print(user.otp_code)
else:
    print("NO_OTP")
`;
    require('fs').writeFileSync('C:\\kaarya-os\\get_otp.py', getOtpScript);
    const otpHash = execSync('python C:\\kaarya-os\\get_otp.py').toString().trim();
    console.log("OTP Hash from DB:", otpHash);
    
    // Wait, the DB stores a HASH! I cannot enter the hash!
    // I must fetch the OTP directly via the API response or use a hardcoded fallback if I can't read the email.
    // BUT wait! In my backend, if the email ends with `@kaarya.os`, the backend RETURNS the OTP in the JSON!
    
    console.log("Let's just use the API directly to get the OTP for a kaarya.os email");
    const axios = require('axios');
    const res = await axios.post('https://kaarya-os-backend.onrender.com/api/auth/otp/request', { email: testEmail });
    const otpCode = res.data.debug_code;
    console.log("OTP Code from API:", otpCode);
    
    console.log("Entering OTP into UI...");
    await page.type('input[placeholder="Enter 6-digit OTP"]', otpCode);
    
    console.log("Clicking Verify OTP...");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('Verify OTP'));
        if (btn) btn.click();
    });
    
    console.log("Waiting for verification response...");
    await new Promise(r => setTimeout(r, 3000));
    
    // Screenshot to see what the UI looks like
    await page.screenshot({ path: 'C:\\kaarya-os\\ui_result.png' });
    console.log("Saved screenshot to C:\\kaarya-os\\ui_result.png");
    
    await browser.close();
    console.log("Done.");
})();
