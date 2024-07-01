import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv'
dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  out: './migrations',
  schema: './src/models/schema.ts',
  dbCredentials: {
    url:process.env.CONNECT_URI!
  },
});