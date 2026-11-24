import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import fs from "fs";
import config from "./config";
import { authRouter } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import { userRoute } from "./modules/user/user.route";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded());

app.use((req: Request, res: Response, next: NextFunction) => {
  const log = `Method: ${req.method} | URL: ${req.url} | Time: ${Date.now()}\n`;
  fs.appendFile("logger.txt", log, (error) => console.log(error));
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

app.use(`/${config.apiVersion}/user`, userRoute);
app.use(`/${config.apiVersion}/profile`, profileRoute);
app.use(`/${config.apiVersion}/auth`, authRouter);

export default app;
