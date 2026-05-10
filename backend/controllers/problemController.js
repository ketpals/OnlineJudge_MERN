const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');


// Get all problems
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find(); // 📦 Fetch all problems

    // 🟢 Check for solution file existence to mark as solved
    const updatedProblems = problems.map((problem) => {
      const solutionFileCpp = path.join(__dirname, '..', 'temp', `solution_${problem._id}.cpp`);
      const solutionFilePy = path.join(__dirname, '..', 'temp', `solution_${problem._id}.py`);

      const isSolved = fs.existsSync(solutionFileCpp) || fs.existsSync(solutionFilePy);

      return {
        ...problem._doc,
        solved: isSolved,
      };
    });

    // ✅ Send response
    return res.status(200).json({
      success: true,
      message: 'Problems fetched successfully',
      problems: updatedProblems
    });

  } catch (error) {
    console.error('❌ Error fetching problems:', error.toString());

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch problems',
      error: error.toString()
    });
  }
};

// Get problem details by ID
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Problem fetched successfully',
      problem,
    });

  } catch (error) {
    console.error('❌ Error fetching problem by ID:', error.toString());

    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching problem details',
      error: error.toString(),
    });
  }
};

// Submit solution with Docker support for C++, Python, and Java
exports.submitSolution = async (req, res) => {
  try {
    const { code, language } = req.body;
    const problemId = req.params.id;

    if (!isCodeSafe(code)) {
      return res.status(400).json({
        success: false,
        message: 'Code contains restricted operations'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // ✅ Determine filename and write code to disk
    let fileName;
    if (language === 'python') {
      fileName = `solution_${problemId}.py`;
      fs.writeFileSync(path.join(tempDir, fileName), code);

    } else if (language === 'java') {
      fileName = `Solution_${problemId}.java`;
      // ✅ Fix class name BEFORE writing to disk
      const fixedCode = code.replace(
        /public\s+class\s+\w+/,
        `public class Solution_${problemId}`
      );
      fs.writeFileSync(path.join(tempDir, fileName), fixedCode);

    } else {
      fileName = `solution_${problemId}.cpp`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
    }

    // ✅ Compile step — C++ and Java only
    if (language === 'cpp') {
      const compileCmd = `docker run --rm -v "${tempDir}:/code" gcc:latest sh -c "g++ /code/${fileName} -o /code/output_${problemId} 2>&1"`;
      try {
        execSync(compileCmd, { timeout: 15000, encoding: 'utf-8' });
      } catch (error) {
        const errorMsg = (error.stdout || error.stderr || error.message)
          .toString()
          .replace(/\/code\//g, '');
        return res.status(400).json({
          success: false,
          message: 'Compilation failed',
          error: errorMsg
        });
      }

    } else if (language === 'java') {
      const compileCmd = `docker run --rm -v "${tempDir}:/code" eclipse-temurin:11 sh -c "javac /code/${fileName} 2>&1"`;
      try {
        execSync(compileCmd, { timeout: 15000, encoding: 'utf-8' });
      } catch (error) {
        const errorMsg = (error.stdout || error.stderr || error.message)
          .toString()
          .replace(/\/code\//g, '');
        return res.status(400).json({
          success: false,
          message: 'Compilation failed',
          error: errorMsg
        });
      }
    }
    // ✅ Python needs no compile step here — already validated in compileCode

    // ✅ Run test cases
    const results = [];
    for (const testCase of problem.testCases) {
      const { input, expectedOutput } = testCase;
      let result = '';
      let hasError = false;
      let errorMsg = '';

      const inputFile = `input_${problemId}.txt`;
      const inputFilePath = path.join(tempDir, inputFile);
      fs.writeFileSync(inputFilePath, input);

      try {
        if (language === 'cpp') {
          const runCmd = `docker run --rm -v "${tempDir}:/code" gcc:latest sh -c "/code/output_${problemId} < /code/${inputFile}"`;
          result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();

        } else if (language === 'python') {
const runCmd = `docker run --rm -v "${tempDir}:/code" python:3.10-alpine sh -c "python /code/${fileName} < /code/${inputFile}"`;          
result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();

        } else if (language === 'java') {
          const classFile = `Solution_${problemId}`;
          const runCmd = `docker run --rm -v "${tempDir}:/code" eclipse-temurin:11 sh -c "cd /code && java ${classFile} < /code/${inputFile}"`;
          result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();
        }

      } catch (error) {
        // ✅ This was missing — runtime errors were silently swallowed before
        hasError = true;
        errorMsg = extractErrorMessage(
          (error.stdout || error.stderr || error.message || '').toString()
        );
        result = '';

      } finally {
        // ✅ Always clean up input file
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      }

      const passed = result === expectedOutput && !hasError;
      results.push({
        input,
        expectedOutput,
result: hasError ? 'Runtime error' : result,
        passed,
        ...(hasError && { error: errorMsg })
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    await Submission.create({
    problemId,
    language,
    code,
    result: passedCount === results.length ? 'Success' : 'Failed',
    passed: passedCount,
    total: results.length,
    testResults: results   // ✅ now saved to DB
});

    return res.status(200).json({
      success: true,
      result: passedCount === results.length ? 'Success' : 'Failed',
      passed: passedCount,
      total: results.length,
      testResults: results
    });

  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during submission',
      error: err.message
    });
  }
};
// Get submissions by problem ID
exports.getSubmissionsByProblemId = async (req, res) => {
  const { id } = req.params;
  try {
    const submissions = await Submission.find({ problemId: id }).sort({ submittedAt: -1 });

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message: 'No submissions found for this problem'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error.toString());
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.toString()
    });
  }
};
// Compile code (C++ only — Python and Java don't need pre-compilation)
// Compile code — C++ (g++), Python (syntax check), Java (javac)
exports.compileCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const problemId = req.params.id;

    if (!isCodeSafe(code)) {
      return res.status(400).json({
        success: false,
        message: 'Code contains restricted operations'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let fileName, compileCmd;

    if (language === 'cpp') {
      fileName = `solution_${problemId}.cpp`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      compileCmd = `docker run --rm -v "${tempDir}:/code" gcc:latest sh -c "g++ /code/${fileName} -o /code/output_${problemId} 2>&1"`;

    } else if (language === 'python') {
      fileName = `solution_${problemId}.py`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      // py_compile checks syntax without running the code
  compileCmd = `docker run --rm -v "${tempDir}:/code" python:3.10-alpine sh -c "python -m py_compile /code/${fileName} 2>&1 && pip install pyflakes -q 2>/dev/null && python -m pyflakes /code/${fileName} 2>&1"`;

    } else if (language === 'java') {
      fileName = `Solution_${problemId}.java`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      compileCmd = `docker run --rm -v "${tempDir}:/code" eclipse-temurin:11 sh -c "javac /code/${fileName} 2>&1"`;

    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    try {
      execSync(compileCmd, { timeout: 15000, encoding: 'utf-8' });
      return res.status(200).json({
        success: true,
        message: 'Compilation successful'
      });
    } catch (error) {
      const errorMsg = (error.stdout || error.stderr || error.message)
        .toString()
        .replace(/\/code\//g, '');
      return res.status(400).json({
        success: false,
        message: 'Compilation failed',
        error: errorMsg
      });
    }

  } catch (err) {
    console.error('Compile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during compilation',
      error: err.message
    });
  }
};
// Helper function: Check if code is safe
function isCodeSafe(code) {
    const blacklist = [
        // System/process operations
        /rm\s+/,
        /del\s+/,
        /shutdown/,
        /reboot/,
        /format\s+/,

        // Shell execution
        /system\s*\(/,
        /os\.system/,
        /subprocess/,
        /popen\s*\(/,
        /shell\s*=\s*True/,

        // Python dangerous imports
        /import\s+os/,
        /import\s+sys/,
        /import\s+subprocess/,
        /from\s+os\s+import/,
        /from\s+sys\s+import/,
        /from\s+subprocess\s+import/,
        /__import__\s*\(/,

        // Python eval/exec
        /\beval\s*\(/,
        /\bexec\s*\(/,
        /compile\s*\(/,

        // Infinite loops
        /while\s*\(\s*true\s*\)/i,
        /while\s*True\s*:/,
        /for\s*\(\s*;;\s*\)/,

        // Java dangerous imports
        /import\s+java\.io\.File/,
        /import\s+java\.lang\.Runtime/,
        /import\s+java\.lang\.ProcessBuilder/,
        /Runtime\.getRuntime/,

        // C++ dangerous calls
        /\bsystem\s*\(/,
        /\bfork\s*\(/,
        /\bexec[lv]?\s*\(/,
        /\bpopen\s*\(/,

        // Network access
        /import\s+socket/,
        /import\s+urllib/,
        /import\s+requests/,
        /import\s+java\.net/,
        /#include\s*<\s*curl/,

        // File system access
        /open\s*\([^)]*['"]\s*w/,   // file write in python
        /fopen\s*\(/,               // C++ file open
        /FileWriter/,               // Java file write
        /FileOutputStream/,
    ];

    return !blacklist.some(pattern => pattern.test(code));
}

// Helper function: Extract error message from stderr
function extractErrorMessage(stderr) {
  const lines = stderr.split('\n').map(line => line.trim()).filter(Boolean);
  const lastRelevant = lines.reverse().find(line =>
    line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')
  );
  return lastRelevant || lines[0] || 'Unknown error';
}
exports.runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;
    const problemId = req.params.id;

    if (!isCodeSafe(code)) {
      return res.status(400).json({
        success: false,
        message: 'Code contains restricted operations'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Write code to disk
    let fileName;
    if (language === 'python') {
      fileName = `solution_${problemId}.py`;
      fs.writeFileSync(path.join(tempDir, fileName), code);

    } else if (language === 'java') {
      fileName = `Solution_${problemId}.java`;
      const fixedCode = code.replace(
        /public\s+class\s+\w+/,
        `public class Solution_${problemId}`
      );
      fs.writeFileSync(path.join(tempDir, fileName), fixedCode);

    } else {
      fileName = `solution_${problemId}.cpp`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
    }

    // Compile if needed
    if (language === 'cpp') {
      const compileCmd = `docker run --rm -v "${tempDir}:/code" gcc:latest sh -c "g++ /code/${fileName} -o /code/output_${problemId} 2>&1"`;
      try {
        execSync(compileCmd, { timeout: 15000, encoding: 'utf-8' });
      } catch (error) {
        const errorMsg = (error.stdout || error.stderr || error.message)
          .toString().replace(/\/code\//g, '');
        return res.status(400).json({
          success: false,
          message: 'Compilation failed',
          error: errorMsg
        });
      }

    } else if (language === 'java') {
      const compileCmd = `docker run --rm -v "${tempDir}:/code" eclipse-temurin:11 sh -c "javac /code/${fileName} 2>&1"`;
      try {
        execSync(compileCmd, { timeout: 15000, encoding: 'utf-8' });
      } catch (error) {
        const errorMsg = (error.stdout || error.stderr || error.message)
          .toString().replace(/\/code\//g, '');
        return res.status(400).json({
          success: false,
          message: 'Compilation failed',
          error: errorMsg
        });
      }
    }

    // Write custom input to file
    const inputFile = `input_${problemId}.txt`;
    const inputFilePath = path.join(tempDir, inputFile);
    fs.writeFileSync(inputFilePath, input || '');

    // Run the code
    let result = '';
    let hasError = false;
    let errorMsg = '';

    try {
      if (language === 'cpp') {
        const runCmd = `docker run --rm -v "${tempDir}:/code" gcc:latest sh -c "/code/output_${problemId} < /code/${inputFile}"`;
        result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();

      } else if (language === 'python') {
        const runCmd = `docker run --rm -v "${tempDir}:/code" python:3.10-alpine sh -c "python /code/${fileName} < /code/${inputFile}"`;
        result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();

      } else if (language === 'java') {
        const classFile = `Solution_${problemId}`;
        const runCmd = `docker run --rm -v "${tempDir}:/code" eclipse-temurin:11 sh -c "cd /code && java ${classFile} < /code/${inputFile}"`;
        result = execSync(runCmd, { timeout: 5000, encoding: 'utf-8' }).toString().trim();
      }

    } catch (error) {
      hasError = true;
      errorMsg = extractErrorMessage(
        (error.stdout || error.stderr || error.message || '').toString()
      );

    } finally {
      if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    }

    return res.status(200).json({
      success: true,
      output: hasError ? null : result,
      error: hasError ? errorMsg : null,
    });

  } catch (err) {
    console.error('Run error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during run',
      error: err.message
    });
  }
};