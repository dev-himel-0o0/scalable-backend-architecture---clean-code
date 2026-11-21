import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT,
  apiVersion: process.env.API_VERSION,
  connectionString: process.env.DATABASE_URL,
};

export default config;
