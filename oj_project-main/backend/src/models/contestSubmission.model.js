import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true
    },
    userId: {
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
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
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
            "Accepted",
            "Wrong Answer",
            "Time Limit Exceeded",
            "Memory Limit Exceeded",
            "Runtime Error",
            "Compilation Error",
            "Pending",
            "Judging"
        ],
        default: "Pending"
    },
    executionTime: {
        type: Number,
        default: 0
    },
    memoryUsed: {
        type: Number,
        default: 0
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    isFirstSolve: {
        type: Boolean,
        default: false
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound indexes for better query performance
contestSubmissionSchema.index({ contestId: 1, userId: 1, problemId: 1 });
contestSubmissionSchema.index({ contestId: 1, problemId: 1, verdict: 1 });
contestSubmissionSchema.index({ contestId: 1, submittedAt: -1 });

// Virtual for penalty calculation (attempts * 20 minutes)
contestSubmissionSchema.virtual('penalty').get(function() {
    if (this.verdict === 'Accepted') {
        return (this.attemptNumber - 1) * 20; // 20 minutes penalty per wrong attempt
    }
    return 0;
});

const ContestSubmission = mongoose.model('ContestSubmission', contestSubmissionSchema);
export default ContestSubmission;


