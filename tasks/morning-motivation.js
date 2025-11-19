// tasks/morning-motivation.js  ←  PERFECT API VERSION (auto chapter rollover)
import cron from 'node-cron';
import { notify } from '../utils/notify.js';

// Persistent state (survives restarts if you deploy on Railway/Render)
let currentChapter = 1;
let currentVerse = 1;

const TOTAL_CHAPTERS = 18;

export const morningMotivationTask = () => {
  cron.schedule('45 10 * * *', async () => {
    try {
      // Fetch the exact verse
      const res = await fetch(`https://bhagavadgita.io/api/v1/chapters/${currentChapter}/verses/${currentVerse}`);
      if (!res.ok) throw new Error('Verse not found');

      const data = await res.json();

      const message = `*Bhagavad Gita ${currentChapter}.${currentVerse}* 🕉️\n\n` +
        `*Sanskrit:*\n${data.slok}\n\n` +
        `*Transliteration:*\n_${data.transliteration}_\n\n` +
        `*English Translation:*\n${data.tej?.en || data.chinmayananda?.en || 'Translation unavailable'}\n\n` +
        `Listen to the divine chant below ↓`;

      await notify(message);

      // Send audio if available
      if (data.audio_link) {
        const audioBlob = await fetch(data.audio_link).then(r => r.blob());
        const form = new FormData();
        form.append('chat_id', process.env.TELEGRAM_CHAT_ID);
        form.append('audio', audioBlob, { filename: `Gita_${currentChapter}_${currentVerse}.mp3` });
        form.append('caption', `Chapter ${currentChapter}, Verse ${currentVerse} — Traditional Sanskrit Chant`);
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_CHAT_TOKEN}/sendAudio`, { method: 'POST', body: form });
      }

      // === AUTOMATIC NEXT VERSE LOGIC (perfect chapter rollover) ===
      currentVerse++;

      // Fetch chapter info to know how many verses it has
      const chapterInfo = await fetch(`https://bhagavadgita.io/api/v1/chapters/${currentChapter}`).then(r => r.json());

      if (currentVerse > chapterInfo.verses_count) {
        currentVerse = 1;
        currentChapter++;
        if (currentChapter > TOTAL_CHAPTERS) {
          currentChapter = 1; // loop back to start after 18.78
          await notify("🎉 Completed the entire Bhagavad Gita! Starting again from Chapter 1 ❤️");
        }
      }

    } catch (e) {
      await notify(`*Bhagavad Gita ${currentChapter}.${currentVerse}* 🕉️\n\nTemporary silence — contemplate the divine within you today`);
    }
  }, { timezone: "Asia/Kolkata" }).start();

  console.log("Bhagavad Gita API version — auto chapter rollover, runs forever perfectly");
};