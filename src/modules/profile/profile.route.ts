import type { Router } from "express";
import express from "express";
import { profileController } from "./profile.controller";

const router: Router = express.Router();

router.post("/", profileController.createProfile);

export const profileRoute = router;
