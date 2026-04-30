import express from 'express';
import {
  getKnowledgeTestQuestions,
  submitKnowledgeTest,
} from '../controllers/knowledgeTestController.js';
import { verifyAccessToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/knowledge-test/questions - Get the test questions
router.get('/questions', verifyAccessToken, getKnowledgeTestQuestions);

// POST /api/knowledge-test/submit - Submit answers and get results
router.post('/submit', verifyAccessToken, submitKnowledgeTest);

export default router;
