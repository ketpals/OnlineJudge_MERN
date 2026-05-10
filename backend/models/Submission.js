const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    language: String,
    code: String,
    result: String,
    passed: Number,
    total: Number,
    testResults: [
        {
            input: String,
            expectedOutput: String,
            result: String,
            passed: Boolean,
            error: String
        }
    ],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Index for fast lookup by problem + most recent first
submissionSchema.index({ problemId: 1, submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);