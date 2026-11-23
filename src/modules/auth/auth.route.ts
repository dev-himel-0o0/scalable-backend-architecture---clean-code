import type { Router } from "express";
import express from "express";
import { authController } from "./auth.controller";

export const authRouter: Router = express.Router();

authRouter.post("/login", authController.logInUser);
authRouter.get("/", authController.getAuths);
authRouter.get("/:id", authController.getAuthById);
authRouter.patch("/:id", authController.updateAuth);
authRouter.delete("/:id", authController.deleteAuth);
