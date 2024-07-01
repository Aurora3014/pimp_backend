// src/server.ts
import app from "./app";
import { getNewTokenDetail } from "./utils/axiosRequest";
import { SSE_Capcha } from "./utils/logic";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  SSE_Capcha();
  //  getNewTokenDetail('fbad64c2f0d4b32617e3cc7c8364750d50f9620d0bff33723d8f54f30c5142d6');
});
