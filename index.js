// index.js  ←  FINAL VERSION WITH ALL YOUR GOD-TIER TASKS
import 'dotenv/config';  // ← Make sure .env is loaded

import { goodMorningTask } from './tasks/good-morning.js';
import { goodEveningTask } from './tasks/good-evening-moon.js';
import { morningMotivationTask } from './tasks/morning-motivation.js';     // ← Gita API
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

if (process.env.RENDER) {
    const express = require('express');
    const app = express();
    app.all('/', (req, res) => res.send('Divine Assistant Running 🕉️'));
    app.listen(process.env.PORT || 10000);
  }

console.log("Starting Your Divine Personal Assistant...\n");

goodMorningTask();
goodEveningTask();
morningMotivationTask();      // ← Bhagavad Gita every morning
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
console.log("Close terminal only after deploying to Railway/Render 🚀");