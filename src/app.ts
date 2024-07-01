// src/app.ts
import express from "express";
import dotenv from 'dotenv'
dotenv.config();
import tokenRoutes from "./routes/tokenRoutes";
import { getNewTokenDetail } from "./utils/axiosRequest";
const app = express();

app.use(express.json());
app.use("/", tokenRoutes);

export default app;
