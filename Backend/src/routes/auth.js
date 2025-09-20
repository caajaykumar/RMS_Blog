import express from 'express';
import { validateToken } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/validate - validate an incoming JWT (from Authorization header or cookie)
router.post('/validate', validateToken);

export default router;
