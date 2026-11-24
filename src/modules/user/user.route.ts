import type { Router } from "express";
import express from "express";
import authToken from "../../middleware/auth";
import { userController } from "./user.controller";

const router: Router = express.Router();

router.post("/", userController.createUser);
router.get("/", authToken, userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUserById);

export const userRoute = router;
