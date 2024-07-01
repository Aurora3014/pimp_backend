import {neon} from "@neondatabase/serverless";
import {drizzle} from 'drizzle-orm/neon-http'
const sql = neon(process.env.CONNECT_URI!);

export const db = drizzle(sql);