// tasks/zerodha-report.js  ←  HEADLESS GMAIL LOGIN (NO API, NO TOKEN ISSUES)
import cron from 'node-cron';
import { notify } from '../utils/notify.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;     // your@gmail.com
const GMAIL_PASS = process.env.GMAIL_PASS;       // your password or app password

if (!GMAIL_EMAIL || !GMAIL_PASS) {
  console.error("GMAIL_EMAIL and GMAIL_PASS must be in .env");
}

export const zerodhaReportTask = () => {
  cron.schedule('0 21 * * *', async () => {
    await notify('🔍 Opening Gmail to find Zerodha Aftermarket Report...');

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.goto('https://mail.google.com', { waitUntil: 'networkidle2' });

      // Login
      await page.type('input[type="email"]', GMAIL_EMAIL);
      await page.click('#identifierNext');
      await page.waitForTimeout(2000);
      await page.type('input[type="password"]', GMAIL_PASS);
      await page.click('#passwordNext');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Search for Zerodha report
      await page.type('input[aria-label="Search in mail"]', 'from:reports@zerodha.com "Aftermarket order update"');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);

      // Click the first (latest) email
      await page.click('div[role="main"] tr.zA:first-child');
      await page.waitForTimeout(5000);

      // Find and download PDF attachment
      const pdfLink = await page.$eval('a[href$=".pdf"]', el => el.href);
      if (!pdfLink) {
        await notify('No PDF found in the email');
        await browser.close();
        return;
      }

      const response = await page.goto(pdfLink);
      const buffer = await response.buffer();

      // Save locally
      const filename = `Zerodha-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      const savePath = path.join(process.cwd(), 'reports', filename);
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
      fs.writeFileSync(savePath, buffer);

      // Send to Telegram
      const form = new FormData();
      form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
      form.append('document', buffer, { filename });
      form.append('caption', `*Zerodha Aftermarket Report Delivered!* 📊\nDate: ${new Date().toLocaleDateString('en-IN')}`);

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: form
      });

      await notify(`PDF delivered! See above ↑`);

    } catch (err) {
      console.error(err);
      await notify(`Zerodha report failed: ${err.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }, { timezone: "Asia/Kolkata" }).start();

  console.log("Zerodha Report → Headless Gmail login (no API) at 9:00 PM daily");
};