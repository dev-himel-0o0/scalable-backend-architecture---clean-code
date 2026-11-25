import cors from "cors";
import type { Express, Request, Response } from "express";
import express from "express";
import config from "./config";
import globalErrorHandler from "./middleware/global-error-handler";
import logger from "./middleware/logger";
import { authRouter } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import { userRoute } from "./modules/user/user.route";

const app: Express = express();
const corsOptions = {
  origin: [config.clientUrlDev],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded());
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

app.use(`/${config.apiVersion}/user`, userRoute);
app.use(`/${config.apiVersion}/profile`, profileRoute);
app.use(`/${config.apiVersion}/auth`, authRouter);

app.use(globalErrorHandler);

export default app;
