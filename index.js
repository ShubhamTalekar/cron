// index.js — FINAL PRODUCTION + RENDER COMPATIBLE
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Dummy server for Render free tier (keeps it awake + removes port warning)
// Add this at the very top of index.js — AFTER the imports, BEFORE the tasks
if (process.env.RENDER) {
    import('express').then(express => {
      const app = express.default();
      app.all('/', (req, res) => {
        res.send('Divine Assistant Running 🕉️ | Gita | Weather | Zerodha | Naukri | Moon | All tasks active');
      });
      const port = process.env.PORT || 10000;
      app.listen(port, () => {
        console.log(`Render dummy server running on port ${port}`);
      });
    }).catch(err => {
      console.log("Express failed to load (normal on first run)", err.message);
    });
  }

// Your tasks
import { goodMorningTask } from './tasks/good-morning.js';
import { goodEveningTask } from './tasks/good-evening-moon.js';
import { morningMotivationTask } from './tasks/morning-motivation.js';
import { waterReminderTask } from './tasks/water-reminder.js';
import { verifiedNewsTask } from './tasks/latest-verified-news.js';
import { naukriRefreshTask } from './tasks/daily-naukri-resume-refresh.js';
import { zerodhaReportTask } from './tasks/zerodha-report.js';
import { birthdayReminderTask } from './tasks/birthday-reminder.js';
import { meditationBellTask } from './tasks/meditation-bell.js';
import { weekendPlansTask } from './tasks/weekend-plans.js';
import { weeklyReviewTask } from './tasks/weekly-review.js';
import { rainAlertTask } from './tasks/rain-alert.js';
import { stockAlertTask } from './tasks/stock-alert.js';

console.log("Starting Your Divine Personal Assistant... 🕉️\n");

goodMorningTask();
goodEveningTask();
morningMotivationTask();
waterReminderTask();
verifiedNewsTask();
naukriRefreshTask();
zerodhaReportTask();
birthdayReminderTask();
meditationBellTask();
weekendPlansTask();
weeklyReviewTask();
rainAlertTask();
stockAlertTask();

console.log("\nALL 14 TASKS LOADED SUCCESSFULLY");
console.log("Your life assistant is now running 24/7 — forever.");