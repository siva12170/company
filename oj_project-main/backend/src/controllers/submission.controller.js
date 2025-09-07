import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";

// Submit code for a problem
const submitCode = AsyncHandler(async (req, res) => {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || !code) {
        throw new ApiError(400, "Problem ID, language, and code are required");
    }

    // Map frontend language to compiler extension
    const languageMapping = {
        'cpp': 'cpp',
        'c': 'c', 
        'java': 'java',
        'python': 'py'
    };

    const extension = languageMapping[language];
    if (!extension) {
        throw new ApiError(400, "Unsupported programming language");
    }

    // Validate if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Create submission record
    const submission = await Submission.create({
        submittedBy: req.user._id,
        problemId,
        language,
        code,
        verdict: "Judging"
    });

    try {
        // Call compiler service to execute code
        const compilerResponse = await fetch(`${process.env.COMPILER_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                extension: extension, // Use mapped extension
                code,
                testcases: problem.testcases,
                timeLimit: problem.timeLimit || 2000,
                memoryLimit: problem.memoryLimit || 256
            })
        });

        const result = await compilerResponse.json();
        console.log('Compiler response:', result);

        // Update submission with results
        const updateData = {
            verdict: result.verdict || "Runtime Error",
            executionTime: result.testResults?.[0]?.executionTime || 0,
            memoryUsed: 0, // Memory tracking not implemented yet
            testCasesPassed: result.passedTests || 0,
            totalTestCases: result.totalTests || 0,
            errorMessage: result.error || null,
            compilerOutput: result.details || null,
            testCaseResults: result.testResults || []
        };

        const updatedSubmission = await Submission.findByIdAndUpdate(
            submission._id,
            updateData,
            { new: true }
        ).populate('submittedBy', 'username email')
         .populate('problemId', 'title difficulty');

        return res.status(200).json(
            new ApiResponse(200, updatedSubmission, "Code submitted successfully")
        );

    } catch (error) {
        // Update submission with error status
        await Submission.findByIdAndUpdate(submission._id, {
            verdict: "Runtime Error",
            errorMessage: error.message
        });

        throw new ApiError(500, `Submission failed: ${error.message}`);
    }
});

// Get all submissions for a user
const getUserSubmissions = AsyncHandler(async (req, res) => {
    const { page = 1, limit = 20, problemId, verdict } = req.query;
    
    const filter = { submittedBy: req.user._id };
    
    if (problemId) {
        filter.problemId = problemId;
    }
    
    if (verdict) {
        filter.verdict = verdict;
    }

    const submissions = await Submission.find(filter)
        .populate('problemId', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const total = await Submission.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            submissions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Submissions retrieved successfully")
    );
});

// Get submission by ID
const getSubmissionById = AsyncHandler(async (req, res) => {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
        .populate('submittedBy', 'username email')
        .populate('problemId', 'title difficulty description');

    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    // Check if user owns the submission or is admin
    if (submission.submittedBy._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, submission, "Submission retrieved successfully")
    );
});

// Get submissions for a specific problem
const getProblemSubmissions = AsyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const submissions = await Submission.find({
        problemId,
        submittedBy: req.user._id
    })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const total = await Submission.countDocuments({
        problemId,
        submittedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, {
            submissions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Problem submissions retrieved successfully")
    );
});

// Get submission statistics for a user
const getSubmissionStats = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await Submission.aggregate([
        { $match: { submittedBy: userId } },
        {
            $group: {
                _id: "$verdict",
                count: { $sum: 1 }
            }
        }
    ]);

    const totalSubmissions = await Submission.countDocuments({ submittedBy: userId });
    
    const acceptedSubmissions = stats.find(stat => stat._id === "Accepted")?.count || 0;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0;

    // Get solved problems count
    const solvedProblems = await Submission.distinct('problemId', {
        submittedBy: userId,
        verdict: 'Accepted'
    });

    return res.status(200).json(
        new ApiResponse(200, {
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate: parseFloat(acceptanceRate),
            solvedProblems: solvedProblems.length,
            verdictBreakdown: stats
        }, "Submission statistics retrieved successfully")
    );
});

export {
    submitCode,
    getUserSubmissions,
    getSubmissionById,
    getProblemSubmissions,
    getSubmissionStats
};
