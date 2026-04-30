import { getQuestions, evaluateTest } from '../services/knowledgeTestService.js';

const getKnowledgeTestQuestions = (req, res) => {
  try {
    const questions = getQuestions();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
};

const submitKnowledgeTest = async (req, res) => {
  try {
    const driverId = req.userId;
    const { answers } = req.body; // answers should be an object like {1: 'A', 2: 'B', ...}

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers must be provided as an object' });
    }

    const result = await evaluateTest(driverId, answers);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Driver not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to evaluate test' });
    }
  }
};

export { getKnowledgeTestQuestions, submitKnowledgeTest };