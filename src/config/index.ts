import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const config = {
  port: process.env.PORT,
  apiVersion: process.env.API_VERSION,
  connectionString: process.env.DATABASE_URL,
  jwtSecret: required("JWT_SECRET"),
};

export default config;
