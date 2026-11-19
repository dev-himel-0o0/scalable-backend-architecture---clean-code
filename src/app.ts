import type { Express, Request, Response } from "express";
import express from "express";
import { userRoute } from "./modules/user/user.route";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

app.use("/api/v1/user", userRoute);

export default app;
