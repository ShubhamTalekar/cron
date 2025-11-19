// tasks/zerodha-report.js  ←  FINAL ROBUST VERSION
import cron from 'node-cron';
import { notify } from '../utils/notify.js';
import { gmail } from '../utils/gmail.js';
import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true }); 
}

export const zerodhaReportTask = () => {
  cron.schedule('*/5 * * * *', async () => {
    let notifiedStart = false;
    try {
      if (!notifiedStart) {
        await notify('🔍 Looking for today\'s Zerodha Aftermarket Report...');
        notifiedStart = true;
      }

      // Search last 2 days (in case email is delayed or holiday yesterday)
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '/');
      const query = `from:reports@zerodha.com subject:"Aftermarket order update" after:${formatDate(yesterday)}`;

      const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 5   // get a few in case multiple
      });

      const messages = res.data.messages || [];
      if (messages.length === 0) {
        await notify('ℹ️ No Zerodha report found (market holiday or no trades today)');
        return;
      }

      // Find the most recent email with PDF
      let pdfDelivered = false;
      for (const msg of messages) {
        if (pdfDelivered) break;

        try {
          const fullMsg = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const headers = fullMsg.data.payload.headers;
          const dateHeader = headers.find(h => h.name === 'Date');
          const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();
          const dateStr = emailDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

          // Recursive find PDF in nested parts
          const findPdf = (parts) => {
            for (const part of parts || []) {
              if (part.mimeType === 'application/pdf' && part.filename) return part;
              if (part.parts) {
                const found = findPdf(part.parts);
                if (found) return found;
              }
            }
            return null;
          };

          const pdfPart = findPdf(fullMsg.data.payload.parts) ||
                         (fullMsg.data.payload.mimeType === 'application/pdf' ? fullMsg.data.payload : null);

          if (!pdfPart) continue;

          let pdfBuffer;
          let filename = pdfPart.filename || `Zerodha-Report-${today.toISOString().split('T')[0]}.pdf`;

          if (pdfPart.body?.attachmentId) {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: msg.id,
              id: pdfPart.body.attachmentId
            });
            const data = attachment.data.data.replace(/-/g, '+').replace(/_/g, '/');
            pdfBuffer = Buffer.from(data, 'base64');
          } else if (pdfPart.body?.data) {
            const data = pdfPart.body.data.replace(/-/g, '+').replace(/_/g, '/');
            pdfBuffer = Buffer.from(data, 'base64');
          } else {
            continue;
          }

          // Save locally
          const savePath = path.join(REPORTS_DIR, filename);
          fs.writeFileSync(savePath, pdfBuffer);

          // Send to Telegram
          const form = new FormData();
          form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
          form.append('document', pdfBuffer, { filename });
          form.append('caption', `*Zerodha Aftermarket Report* 📊\n\nDate: ${dateStr}\nSize: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);

          const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: form
          });

          if (telegramRes.ok) {
            await notify(`✅ *Zerodha Report Delivered!* 📄\n${filename}\nSee PDF above ↑`);
            pdfDelivered = true;
          } else {
            const err = await telegramRes.text();
            await notify(`⚠️ Report downloaded but Telegram send failed:\n${err}`);
          }
        } catch (e) {
          console.error('Error processing message', msg.id, e);
          continue; // try next email
        }
      }

      if (!pdfDelivered) {
        await notify('⚠️ Found Zerodha emails but no PDF attachment');
      }

    } catch (err) {
      console.error('Zerodha task crashed:', err);
      await notify(`❌ Zerodha report error: ${err.message || err}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }).start();

  console.log("✅ Zerodha Report → Robust delivery to Telegram at 9:00 PM daily");
};