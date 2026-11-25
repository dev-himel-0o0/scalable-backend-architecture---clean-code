import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT,
  clientUrlDev: process.env.CLIENT_URL_DEV as string,
  apiVersion: process.env.API_VERSION,
  connectionString: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
};

export default config;
