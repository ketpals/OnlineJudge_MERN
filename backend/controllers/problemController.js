const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Problem = require('../models/Problem');

// Get all problems
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();  // Fetch all problems from MongoDB

        // Check for solution file existence in the temp folder for each problem
        const updatedProblems = problems.map((problem) => {
            const solutionFileCpp = path.join(__dirname, '..', 'temp', `solution_${problem._id}.cpp`);
            const solutionFilePy = path.join(__dirname, '..', 'temp', `solution_${problem._id}.py`);

            // If either C++ or Python solution exists, mark the problem as solved
            const isSolved = fs.existsSync(solutionFileCpp) || fs.existsSync(solutionFilePy);

            return {
                ...problem._doc, // Use _doc to access the raw object from Mongoose
                solved: isSolved,
            };
        });

        res.json(updatedProblems);  // Send the updated problems back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problems' });
    }
};

// Get problem details by ID
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);  // Find the problem by ID from MongoDB
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);  // Send the problem details back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error fetching problem details' });
    }
};

// Submit solution
exports.submitSolution = async (req, res) => {
    const { code, language } = req.body;  // User-submitted code and language (C++ or Python)
    const problemId = req.params.id;  // Get problem ID
    const problem = await Problem.findById(problemId);  // Get problem by ID from MongoDB

    // Check if the problem exists
    if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    // Create the temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    // Create a file for the user’s submitted code based on problem ID
    const fileName = language === 'python' ? `solution_${problemId}.py` : `solution_${problemId}.cpp`;
    const filePath = path.join(tempDir, fileName);

    // Save the user's code to a temporary file named solution_<problemId>.cpp/.py
    fs.writeFileSync(filePath, code);

    // Define Docker commands to compile and run the code
    let runCommand;
    if (language === 'cpp') {
        runCommand = (input) => `docker run --rm -v ${filePath}:/code/solution_${problemId}.cpp gcc:latest sh -c "g++ /code/solution_${problemId}.cpp -o /code/output && echo ${input} | /code/output"`;
    } else if (language === 'python') {
        runCommand = (input) => `docker run --rm -v ${filePath}:/code/solution_${problemId}.py python:latest sh -c "echo ${input} | python3 /code/solution_${problemId}.py"`;
    }

    let results = [];

    // Loop through each test case, run the user's code, and compare the output with expected output
    for (const testCase of problem.testCases) {
        const { input, expectedOutput } = testCase;

        try {
            // Run the code with the test case input
            const result = execSync(runCommand(input)).toString().trim();

            // Check if the output matches the expected output
            const passed = result === expectedOutput;
            results.push({ input, expectedOutput, result, passed });
        } catch (error) {
            return res.status(400).json({ message: 'Error running code', error: error.toString() });
        }
    }

    // Calculate how many test cases passed
    const passedCount = results.filter(r => r.passed).length;

    // Return the results of all test cases
    res.json({ result: passedCount === results.length ? 'Success' : 'Failed', passed: passedCount, total: results.length });
};
