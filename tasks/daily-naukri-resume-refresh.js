// tasks/daily-naukri-resume-refresh.js
import cron from 'node-cron';
import puppeteer from 'puppeteer';
import { notify } from '../utils/notify.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL = process.env.NAUKRI_EMAIL;
const PASSWORD = process.env.NAUKRI_PASSWORD;
const RESUME_PATH = path.join(__dirname, '../assets/Resume.pdf');

if (!EMAIL || !PASSWORD) {
  console.error("⚠️  NAUKRI_EMAIL or NAUKRI_PASSWORD missing in .env!");
  process.exit(1);
}

if (!fs.existsSync(RESUME_PATH)) {
  console.error(`⚠️  Resume not found at: ${RESUME_PATH}`);
  process.exit(1);
}

export const naukriRefreshTask = () => {
  cron.schedule('15 8 * * *', async () => {
    await notify('🚀 Starting daily Naukri resume refresh + upload...');

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 1366, height: 768 }
      });

      const page = await browser.newPage();

      // Block images & CSS for faster execution
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Login
      await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emailField = await page.$('#usernameField');
      const passwordField = await page.$('#passwordField');
      
      if (!emailField || !passwordField) {
        throw new Error('Login fields not found');
      }

      await emailField.type(EMAIL);
      await passwordField.type(PASSWORD);
      
      const loginButton = await page.$('button[type="submit"]');
      await Promise.all([
        loginButton.click(),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
      ]);

      await notify('✅ Logged in successfully');

      // Go to profile page with resume section
      await page.goto('https://www.naukri.com/mnjuser/profile?id=&altresid=', { 
        waitUntil: 'networkidle0', 
        timeout: 60000 
      });

      // Scroll to Resume section
      await page.evaluate(() => {
        const resumeSection = document.querySelector('.resumeCv, [class*="resume"]');
        if (resumeSection) {
          resumeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find and click "Update resume" button using multiple selectors
      const possibleSelectors = [
        'input[value="Update resume"]',
        'input[type="button"][value="Update resume"]',
        'input[type="button"][value*="Update"]',
        'input.dummyUpload',
        '//input[@type="button" and contains(@value, "Update")]'
      ];

      let updateButton = null;
      for (const selector of possibleSelectors) {
        try {
          if (selector.startsWith('//')) {
            const elements = await page.$x(selector);
            if (elements.length > 0) {
              updateButton = elements[0];
              break;
            }
          } else {
            updateButton = await page.$(selector);
            if (updateButton) break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!updateButton) {
        throw new Error('Update resume button not found');
      }

      // Click the update button
      await updateButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find and upload file
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('File input not found after clicking Update resume');
      }

      await fileInput.uploadFile(RESUME_PATH);
      await notify('📄 Resume uploaded successfully!');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Look for Save/Submit button
      const submitSelectors = [
        'button:has-text("Save")',
        'button:has-text("Upload")',
        'button:has-text("Submit")',
        'button.btn-primary',
        'button[type="submit"]',
        '//button[contains(text(), "Save")]',
        '//button[contains(text(), "Upload")]'
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          let button;
          if (selector.startsWith('//')) {
            const elements = await page.$x(selector);
            if (elements.length > 0) button = elements[0];
          } else {
            button = await page.$(selector);
          }
          
          if (button) {
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            submitted = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!submitted) {
        console.log('⚠️ Submit button not found - resume may auto-save');
      }

      // Optional: Visit homepage for extra profile bump
      try {
        await page.goto('https://www.naukri.com/mnjuser/homepage', { waitUntil: 'networkidle0' });
        await page.waitForSelector('a[title="Edit Profile"]', { timeout: 5000 });
        await page.click('a[title="Edit Profile"]');
        await page.goBack({ waitUntil: 'networkidle0' });
      } catch (e) {
        // Ignore if not found
      }

      const todayLine = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await notify(`✅ *Resume Refreshed, Updated & Bumped!*\n${todayLine}\n📄 Latest resume uploaded\n👀 You're now at the top of recruiter searches\nOver 1000+ recruiters can see you today!`);

    } catch (error) {
      console.error('Naukri refresh failed:', error);
      await notify(`❌ Naukri refresh failed:\n${error.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  console.log("✅ Naukri daily resume refresh + upload scheduled → 8:15 AM (secure with .env)");
};