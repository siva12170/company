import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        index: true
    },
    language: {
        type: String,
        enum: ["java", "python", "cpp", "c"],
        required: true
    },
    code: {
        type: String,
        required: true
    },
    verdict: {
        type: String,
        enum: [
            "Accepted",           // All test cases passed
            "Wrong Answer",       // WA - Failed on some test cases
            "Time Limit Exceeded", // TLE - Time limit exceeded
            "Memory Limit Exceeded", // MLE - Memory limit exceeded
            "Runtime Error",      // RE - Runtime error
            "Compilation Error",  // CE - Compilation failed
            "Pending",           // Submission is being processed
            "Judging"            // Currently being judged
        ],
        default: "Pending"
    },
    executionTime: {
        type: Number,
        default: 0,
        validate: {
            validator: value => value >= 0,
            message: "Execution time must be non-negative"
        }
    },
    memoryUsed: {
        type: Number,
        default: 0,
        validate: {
            validator: value => value >= 0,
            message: "Memory used must be non-negative"
        }
    },
    testCasesPassed: {
        type: Number,
        default: 0,
        validate: {
            validator: value => value >= 0,
            message: "Test cases passed must be non-negative"
        }
    },
    totalTestCases: {
        type: Number,
        default: 0,
        validate: {
            validator: value => value >= 0,
            message: "Total test cases must be non-negative"
        }
    },
    errorMessage: {
        type: String,
        default: null
    },
    compilerOutput: {
        type: String,
        default: null
    },
    testCaseResults: [{
        testCase: Number,
        verdict: String,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        executionTime: Number,
        error: String,
        visible: {
            type: Boolean,
            default: false
        }
    }]
}, { timestamps: true })

const Submission = mongoose.model('Submission', submissionSchema)
export default Submission