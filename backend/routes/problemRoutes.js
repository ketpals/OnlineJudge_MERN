const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.get('/problems', problemController.getAllProblems);
router.get('/problems/:id', problemController.getProblemById);
router.post('/problems/:id/compile', problemController.compileCode);   // ✅ now works
router.post('/problems/:id/run', problemController.runCode);
router.post('/problems/:id/submit', problemController.submitSolution);  // ✅ no duplicate
router.get('/submissions/:id', problemController.getSubmissionsByProblemId);

module.exports = router;