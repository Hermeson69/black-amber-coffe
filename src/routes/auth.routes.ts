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
 */
authRoutes.post(
  "/auth/register",
  clientController.createClient.bind(clientController),
);

export {authRoutes}