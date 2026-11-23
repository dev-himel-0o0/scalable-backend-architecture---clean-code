import type { Express, Request, Response } from "express";
import express from "express";
import config from "./config";
import { authRouter } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import { userRoute } from "./modules/user/user.route";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

app.use(`/${config.apiVersion}/user`, userRoute);
app.use(`/${config.apiVersion}/profile`, profileRoute);
app.use(`/${config.apiVersion}/auth`, authRouter);

export default app;
