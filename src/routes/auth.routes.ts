import { Router } from "express";

import authController from "../modules/auth/auth.controller";
import authService from "../modules/auth/auth.service";
import authRepository from "../modules/auth/auth.repository";
import JWTservice from "../core/jwt.service";
import { db } from "../config/database";

const authRoutes = Router();

const clientRepository = new authRepository(db);
const jwtService = new JWTservice();
const clientService = new authService(clientRepository, jwtService);
const clientController = new authController(clientService);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo cliente
 *     description: Cria um novo cliente no banco de dados
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Cliente registrado com sucesso
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
 *                     email:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     name:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         avatarImage:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 */
authRoutes.post(
  "/auth/register",
  clientController.createClient.bind(clientController),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do cliente
 *     description: Autentica cliente com email e senha e retorna tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         publicId:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         profile:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                             avatarImage:
 *                               type: string
 *                               nullable: true
 *                             createdAt:
 *                               type: string
 *       400:
 *         description: Dados inválidos ou credenciais incorretas
 */

authRoutes.post("/auth/login", clientController.login.bind(clientController));

export { authRoutes };
