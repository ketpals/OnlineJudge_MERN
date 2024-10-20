const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: String,
    difficulty: String,
    statement: String,
    examples: [String],
    constraints: [String],
    testCases: [{
        input: String,
        expectedOutput: String
    }]
});

module.exports = mongoose.model('Problem', problemSchema);
