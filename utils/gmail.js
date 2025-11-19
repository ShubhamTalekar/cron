// utils/gmail.js
import { google } from 'googleapis';
import 'dotenv/config';

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

export const gmail = google.gmail({ version: 'v1', auth });