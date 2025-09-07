import Problem from "../models/problem.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// Create a new problem
const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        timeLimit,
        memoryLimit,
        testcases
    } = req.body;

    // Validation
    if (!title || !description || !difficulty || !timeLimit || !memoryLimit) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (!testcases || testcases.length === 0) {
        throw new ApiError(400, "At least one test case is required");
    }

    // Validate testcases format
    for (let i = 0; i < testcases.length; i++) {
        if (!testcases[i].input || !testcases[i].output) {
            throw new ApiError(400, `Test case ${i + 1} must have both input and output`);
        }
    }

    // Create problem
    const problem = await Problem.create({
        author: req.user._id,
        title: title.trim(),
        description,
        difficulty,
        tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [],
        timeLimit,
        memoryLimit,
        testcases
    });

    const createdProblem = await Problem.findById(problem._id).populate('author', 'username fullName');

    return res.status(201).json(
        new ApiResponse(201, createdProblem, "Problem created successfully")
    );
});

// Get all problems (with pagination)
const getAllProblems = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { difficulty, tags, search } = req.query;
    
    let filter = {};
    
    if (difficulty) {
        filter.difficulty = difficulty;
    }
    
    if (tags) {
        filter.tags = { $in: tags.split(',').map(tag => tag.trim().toLowerCase()) };
    }
    
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }

    const problems = await Problem.find(filter)
        .select('-testcases') // Don't send test cases in list view
        .populate('author', 'username fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Problem.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            problems,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProblems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Problems fetched successfully")
    );
});

// Get problem by ID
const getProblemById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id).populate('author', 'username fullName');

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Only send visible test cases to regular users
    if (req.user.accType !== "Admin" && req.user._id.toString() !== problem.author._id.toString()) {
        problem.testcases = problem.testcases.filter(testcase => testcase.visible === true);
    }

    return res.status(200).json(
        new ApiResponse(200, problem, "Problem fetched successfully")
    );
});

// Update problem (only by author or admin)
const updateProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        difficulty,
        tags,
        timeLimit,
        memoryLimit,
        testcases
    } = req.body;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Check if user is author or admin
    if (req.user.accType !== "Admin" && req.user._id.toString() !== problem.author.toString()) {
        throw new ApiError(403, "You can only update your own problems");
    }

    // Update fields if provided
    if (title) problem.title = title.trim();
    if (description) problem.description = description;
    if (difficulty) problem.difficulty = difficulty;
    if (tags) problem.tags = tags.map(tag => tag.trim().toLowerCase());
    if (timeLimit) problem.timeLimit = timeLimit;
    if (memoryLimit) problem.memoryLimit = memoryLimit;
    if (testcases) {
        // Validate testcases
        for (let i = 0; i < testcases.length; i++) {
            if (!testcases[i].input || !testcases[i].output) {
                throw new ApiError(400, `Test case ${i + 1} must have both input and output`);
            }
        }
        problem.testcases = testcases;
    }

    const updatedProblem = await problem.save();
    const populatedProblem = await Problem.findById(updatedProblem._id).populate('author', 'username fullName');

    return res.status(200).json(
        new ApiResponse(200, populatedProblem, "Problem updated successfully")
    );
});

// Delete problem (only by author or admin)
const deleteProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Check if user is author or admin
    if (req.user.accType !== "Admin" && req.user._id.toString() !== problem.author.toString()) {
        throw new ApiError(403, "You can only delete your own problems");
    }

    await Problem.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Problem deleted successfully")
    );
});

// Get problems by current user (for problemsetter dashboard)
const getMyProblems = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problems = await Problem.find({ author: req.user._id })
        .populate('author', 'username fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Problem.countDocuments({ author: req.user._id });

    return res.status(200).json(
        new ApiResponse(200, {
            problems,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProblems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Your problems fetched successfully")
    );
});

export {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getMyProblems
};
