import type { Router } from "express";
import express from "express";
import { USER_ROLE } from "../../constants";
import authToken from "../../middleware/auth";
import { userController } from "./user.controller";

const router: Router = express.Router();

router.post(
  "/",
  authToken(USER_ROLE.admin, USER_ROLE.user),
  userController.createUser,
);
router.get(
  "/",
  authToken(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user),
  userController.getUsers,
);
router.get(
  "/:id",
  authToken(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user),
  userController.getUserById,
);
router.put(
  "/:id",
  authToken(USER_ROLE.admin, USER_ROLE.user),
  userController.updateUser,
);
router.delete(
  "/:id",
  authToken(USER_ROLE.admin, USER_ROLE.user),
  userController.deleteUserById,
);

export const userRoute = router;
