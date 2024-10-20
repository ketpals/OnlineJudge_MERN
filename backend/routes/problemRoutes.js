const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Route to get all problems
router.get('/problems', problemController.getAllProblems);

// Route to get problem by ID
router.get('/problems/:id', problemController.getProblemById);

// Route to submit a solution
router.post('/problems/:id/submit', problemController.submitSolution);

module.exports = router;
