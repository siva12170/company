import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import Contest from "../models/contest.model.js";
import Submission from "../models/submission.model.js";
import ContestSubmission from "../models/contestSubmission.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { accType, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let filter = {};
    
    if (accType) {
        filter.accType = accType;
    }
    
    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Users fetched successfully")
    );
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
        .select('-password -refreshToken')
        .populate('submissions');
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

// Update user details
export const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { fullName, username, email, accType, isActive } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // prevent admin from editing self
    if (req.user._id.toString() === userId.toString()) {
        throw new ApiError(403, "Admins cannot edit their own account via admin APIs");
    }
    
    // Check if username or email already exists (excluding current user)
    if (username && username !== user.username) {
        const existingUser = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUser) {
            throw new ApiError(400, "Username already exists");
        }
    }
    
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            throw new ApiError(400, "Email already exists");
        }
    }
    
    // Update fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (accType) user.accType = accType;
    if (isActive !== undefined) user.isActive = isActive;
    
    const updatedUser = await user.save();
    
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Don't allow deleting admin users
    if (user.accType === 'Admin') {
        throw new ApiError(403, "Cannot delete admin users");
    }

    // prevent deleting self just in case
    if (req.user._id.toString() === userId.toString()) {
        throw new ApiError(403, "Admins cannot delete their own account");
    }
    
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
});

// Create user
export const createUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password, accType = 'User' } = req.body;
    if (!fullName || !username || !email || !password) {
        throw new ApiError(400, "fullName, username, email and password are required");
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
        throw new ApiError(400, "A user with that email or username already exists");
    }
    const newUser = await User.create({ fullName, username, email, password, accType });
    const safeUser = await User.findById(newUser._id).select('-password -refreshToken');
    return res.status(201).json(new ApiResponse(201, safeUser, "User created successfully"));
});

// Change role
export const changeUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { accType } = req.body;
    if (!['User', 'Problemsetter', 'Admin'].includes(accType)) {
        throw new ApiError(400, "Invalid role");
    }
    if (req.user._id.toString() === userId.toString()) {
        throw new ApiError(403, "Admins cannot change their own role");
    }
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    user.accType = accType;
    await user.save();
    const safeUser = await User.findById(userId).select('-password -refreshToken');
    return res.status(200).json(new ApiResponse(200, safeUser, "Role updated successfully"));
});

// ==================== PROBLEM MANAGEMENT ====================

// Get all problems with admin privileges
export const getAllProblemsAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { difficulty, tags, search, author } = req.query;
    
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
    
    if (author) {
        filter.author = author;
    }
    
    const problems = await Problem.find(filter)
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

// Update problem (admin can edit any problem)
export const updateProblemAdmin = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const {
        title,
        description,
        difficulty,
        tags,
        timeLimit,
        memoryLimit,
        testcases
    } = req.body;
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
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
    const populatedProblem = await Problem.findById(updatedProblem._id)
        .populate('author', 'username fullName');
    
    return res.status(200).json(
        new ApiResponse(200, populatedProblem, "Problem updated successfully")
    );
});

// Delete problem
export const deleteProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }
    
    // Check if problem is used in any contests
    const contestUsingProblem = await Contest.findOne({
        'problems.problemId': problemId
    });
    
    if (contestUsingProblem) {
        throw new ApiError(400, "Cannot delete problem that is used in contests");
    }
    
    await Problem.findByIdAndDelete(problemId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Problem deleted successfully")
    );
});

// ==================== CONTEST MANAGEMENT ====================

// Create contest
export const createContest = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        startTime,
        endTime,
        problems,
        isPublic = true,
        maxParticipants = null
    } = req.body;
    
    // Validation
    if (!title || !description || !startTime || !endTime) {
        throw new ApiError(400, "Title, description, start time, and end time are required");
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
        throw new ApiError(400, "End time must be after start time");
    }
    
    if (start <= new Date()) {
        throw new ApiError(400, "Start time must be in the future");
    }
    
    // Validate problems if provided
    if (problems && problems.length > 0) {
        for (const problem of problems) {
            const problemExists = await Problem.findById(problem.problemId);
            if (!problemExists) {
                throw new ApiError(400, `Problem with ID ${problem.problemId} not found`);
            }
        }
    }
    
    const contest = await Contest.create({
        title: title.trim(),
        description,
        startTime: start,
        endTime: end,
        createdBy: req.user._id,
        problems: problems || [],
        isPublic,
        maxParticipants
    });
    
    const populatedContest = await Contest.findById(contest._id)
        .populate('createdBy', 'username fullName')
        .populate('problems.problemId', 'title difficulty tags');
    
    return res.status(201).json(
        new ApiResponse(201, populatedContest, "Contest created successfully")
    );
});

// Get all contests
export const getAllContests = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, search } = req.query;
    
    let filter = {};
    
    if (status) {
        filter.status = status;
    }
    
    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }
    
    const contests = await Contest.find(filter)
        .populate('createdBy', 'username fullName')
        .populate('problems.problemId', 'title difficulty')
        .populate('participants.user', 'username fullName')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await Contest.countDocuments(filter);
    
    return res.status(200).json(
        new ApiResponse(200, {
            contests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalContests: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Contests fetched successfully")
    );
});

// Update contest
export const updateContest = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    const {
        title,
        description,
        startTime,
        endTime,
        problems,
        isPublic,
        maxParticipants
    } = req.body;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Update fields if provided
    if (title) contest.title = title.trim();
    if (description) contest.description = description;
    if (startTime) contest.startTime = new Date(startTime);
    if (endTime) contest.endTime = new Date(endTime);
    if (problems) contest.problems = problems;
    if (isPublic !== undefined) contest.isPublic = isPublic;
    if (maxParticipants !== undefined) contest.maxParticipants = maxParticipants;
    
    // Update status based on new times
    await contest.updateStatus();
    
    const updatedContest = await Contest.findById(contest._id)
        .populate('createdBy', 'username fullName')
        .populate('problems.problemId', 'title difficulty')
        .populate('participants.user', 'username fullName');
    
    return res.status(200).json(
        new ApiResponse(200, updatedContest, "Contest updated successfully")
    );
});

// Delete contest
export const deleteContest = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Don't allow deleting ongoing contests
    if (contest.status === 'ongoing') {
        throw new ApiError(400, "Cannot delete ongoing contests");
    }
    
    await Contest.findByIdAndDelete(contestId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Contest deleted successfully")
    );
});

// ==================== DASHBOARD STATISTICS ====================

// Get admin dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalProblems,
        totalContests,
        totalSubmissions,
        recentUsers,
        recentProblems,
        recentContests,
        activeContests
    ] = await Promise.all([
        User.countDocuments(),
        Problem.countDocuments(),
        Contest.countDocuments(),
        Submission.countDocuments(),
        User.find().select('username fullName createdAt').sort({ createdAt: -1 }).limit(5),
        Problem.find().select('title difficulty createdAt').populate('author', 'username').sort({ createdAt: -1 }).limit(5),
        Contest.find().select('title status startTime').populate('createdBy', 'username').sort({ createdAt: -1 }).limit(5),
        Contest.find({ status: 'ongoing' }).select('title startTime endTime').populate('participants.user', 'username').limit(5)
    ]);
    
    const stats = {
        totalUsers,
        totalProblems,
        totalContests,
        totalSubmissions,
        recentUsers,
        recentProblems,
        recentContests,
        activeContests
    };
    
    return res.status(200).json(
        new ApiResponse(200, stats, "Dashboard statistics fetched successfully")
    );
});

