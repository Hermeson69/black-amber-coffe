import { Router } from "express";
import userController from "@/modules/user/user.controller";
import userService from "@/modules/user/user.service";
import userRepository from "@/modules/user/user.repository";
import authRepository from "@/modules/auth/auth.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { db } from "@/config/database";

const userRoutes = Router();

// Initialize dependencies
const authRepo = new authRepository(db);
const userRepo = new userRepository(db);
const userSvc = new userService(authRepo, userRepo);
const userCtrl = new userController(userSvc);

/**
 * @swagger
 * /api/user/get/me:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
userRoutes.get("/user/get/me", AuthMiddleware, (req, res) =>
  userCtrl.getById(req, res),
);

/**
 * @swagger
 * /api/user/update/me:
 *   patch:
 *     summary: Update authenticated user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
userRoutes.patch("/user/update/me", AuthMiddleware, (req, res) =>
  userCtrl.update(req, res),
);

/**
 * @swagger
 * /api/user/delete/me:
 *   delete:
 *     summary: Delete authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
userRoutes.delete("/user/delete/me", AuthMiddleware, (req, res) =>
  userCtrl.delete(req, res),
);

export { userRoutes };
