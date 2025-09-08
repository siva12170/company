import Contest from "../models/contest.model.js";
import ContestSubmission from "../models/contestSubmission.model.js";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { getIO } from "../socketInstance.js";

// ==================== CONTEST REGISTRATION ====================

// Register for a contest
export const registerForContest = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    const userId = req.user._id;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Check if contest is public
    if (!contest.isPublic) {
        throw new ApiError(403, "This contest is not public");
    }
    
    // Check if user is already registered
    const isAlreadyRegistered = contest.participants.some(
        participant => participant.user.toString() === userId.toString()
    );
    
    if (isAlreadyRegistered) {
        throw new ApiError(400, "You are already registered for this contest");
    }
    
    // Check if contest has reached max participants
    if (contest.maxParticipants && contest.participants.length >= contest.maxParticipants) {
        throw new ApiError(400, "Contest has reached maximum participants");
    }
    
    // Check if registration is still open (before start time)
    const now = new Date();
    if (now >= contest.startTime) {
        throw new ApiError(400, "Registration is closed for this contest");
    }
    
    // Add user to participants
    contest.participants.push({
        user: userId,
        registeredAt: new Date(),
        score: 0,
        solvedProblems: []
    });
    
    await contest.save();
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Successfully registered for contest")
    );
});

// Unregister from a contest
export const unregisterFromContest = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    const userId = req.user._id;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Check if user is registered
    const participantIndex = contest.participants.findIndex(
        participant => participant.user.toString() === userId.toString()
    );
    
    if (participantIndex === -1) {
        throw new ApiError(400, "You are not registered for this contest");
    }
    
    // Check if contest has started
    const now = new Date();
    if (now >= contest.startTime) {
        throw new ApiError(400, "Cannot unregister after contest has started");
    }
    
    // Remove user from participants
    contest.participants.splice(participantIndex, 1);
    await contest.save();
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Successfully unregistered from contest")
    );
});

// ==================== CONTEST PARTICIPATION ====================

// Get contest details for participants
export const getContestDetails = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    const userId = req.user._id;
    
    const contest = await Contest.findById(contestId)
        .populate('createdBy', 'username fullName')
        .populate('problems.problemId', 'title difficulty tags timeLimit memoryLimit')
        .populate('participants.user', 'username fullName');
    
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Check if user is registered
    const isRegistered = contest.participants.some(
        participant => participant.user._id.toString() === userId.toString()
    );
    
    if (!isRegistered) {
        throw new ApiError(403, "You are not registered for this contest");
    }
    
    // Get user's submissions for this contest
    const userSubmissions = await ContestSubmission.find({
        contestId,
        userId
    }).sort({ submittedAt: -1 });
    
    // Calculate user's current score and solved problems
    const userParticipant = contest.participants.find(
        p => p.user._id.toString() === userId.toString()
    );
    
    const contestData = {
        ...contest.toObject(),
        userSubmissions,
        userScore: userParticipant?.score || 0,
        userSolvedProblems: userParticipant?.solvedProblems || []
    };
    
    return res.status(200).json(
        new ApiResponse(200, contestData, "Contest details fetched successfully")
    );
});

// Submit solution for contest problem
export const submitContestSolution = asyncHandler(async (req, res) => {
    const { contestId, problemId } = req.params;
    const { language, code } = req.body;
    const userId = req.user._id;
    
    if (!language || !code) {
        throw new ApiError(400, "Language and code are required");
    }
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Check if user is registered
    const isRegistered = contest.participants.some(
        participant => participant.user.toString() === userId.toString()
    );
    
    if (!isRegistered) {
        throw new ApiError(403, "You are not registered for this contest");
    }
    
    // Check if contest is active
    const now = new Date();
    if (now < contest.startTime || now > contest.endTime) {
        throw new ApiError(400, "Contest is not currently active");
    }
    
    // Check if problem is in contest
    const contestProblem = contest.problems.find(
        p => p.problemId.toString() === problemId
    );
    
    if (!contestProblem) {
        throw new ApiError(404, "Problem not found in this contest");
    }
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }
    
    // Get user's attempt number for this problem
    const existingSubmissions = await ContestSubmission.find({
        contestId,
        userId,
        problemId
    });
    
    const attemptNumber = existingSubmissions.length + 1;
    
    // Create contest submission record (contest-local)
    const contestSubmission = await ContestSubmission.create({
        contestId,
        userId,
        problemId,
        language,
        code,
        verdict: "Judging",
        attemptNumber
    });
    
    try {
        // Call compiler service
        const languageMapping = {
            'cpp': 'cpp',
            'c': 'c',
            'java': 'java',
            'python': 'py'
        };
        
        const extension = languageMapping[language];
        const compilerResponse = await fetch(`${process.env.COMPILER_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                extension,
                code,
                testcases: problem.testcases,
                timeLimit: problem.timeLimit || 2000,
                memoryLimit: problem.memoryLimit || 256
            })
        });
        
        const result = await compilerResponse.json();
        
        // Create a normal submission record for history
        const normalSubmission = await Submission.create({
            submittedBy: userId,
            problemId,
            language,
            code,
            verdict: "Judging"
        });

        // Update contest submission with results
        const updateData = {
            verdict: result.verdict || "Runtime Error",
            executionTime: result.testResults?.[0]?.executionTime || 0,
            memoryUsed: 0,
            testCasesPassed: result.passedTests || 0,
            totalTestCases: result.totalTests || 0,
            points: result.verdict === 'Accepted' ? contestProblem.points : 0,
            submissionId: normalSubmission._id
        };
        
        const updatedSubmission = await ContestSubmission.findByIdAndUpdate(
            contestSubmission._id,
            updateData,
            { new: true }
        );
        
        // Update normal submission with the same results
        await Submission.findByIdAndUpdate(normalSubmission._id, {
            verdict: updateData.verdict,
            executionTime: updateData.executionTime,
            memoryUsed: 0,
            testCasesPassed: updateData.testCasesPassed,
            totalTestCases: updateData.totalTestCases,
            errorMessage: result.error || null,
            compilerOutput: result.details || null,
            testCaseResults: result.testResults || []
        });

        // If accepted, update contest participant score
        if (result.verdict === 'Accepted') {
            const participant = contest.participants.find(
                p => p.user.toString() === userId.toString()
            );
            
            if (participant) {
                // Check if this is the first solve
                const isFirstSolve = !participant.solvedProblems.some(
                    sp => sp.problemId.toString() === problemId
                );
                
                if (isFirstSolve) {
                    participant.score += contestProblem.points;
                    participant.solvedProblems.push({
                        problemId,
                        solvedAt: new Date(),
                        points: contestProblem.points,
                        attempts: attemptNumber
                    });
                    
                    updatedSubmission.isFirstSolve = true;
                    await updatedSubmission.save();
                }
            }
            
            await contest.save();
        }
        
        // Emit leaderboard update event
        try {
            const io = getIO();
            if (io) {
                io.to(`contest_${contestId}`).emit('leaderboard:update', { contestId });
            }
        } catch {}

        return res.status(200).json(
            new ApiResponse(200, updatedSubmission, "Solution submitted successfully")
        );
        
    } catch (error) {
        // Update submission with error status
        await ContestSubmission.findByIdAndUpdate(contestSubmission._id, {
            verdict: "Runtime Error",
            errorMessage: error.message
        });
        
        throw new ApiError(500, `Submission failed: ${error.message}`);
    }
});

// ==================== LEADERBOARD ====================

// Get contest leaderboard
export const getContestLeaderboard = asyncHandler(async (req, res) => {
    const { contestId } = req.params;
    
    const contest = await Contest.findById(contestId)
        .populate('participants.user', 'username fullName')
        .populate('problems.problemId', 'title');
    
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    
    // Sort participants by score (descending) and then by total time (ascending)
    const leaderboard = contest.participants
        .map(participant => {
            const totalTime = participant.solvedProblems.reduce((total, solved) => {
                const problem = contest.problems.find(p => 
                    p.problemId._id.toString() === solved.problemId.toString()
                );
                return total + (solved.attempts - 1) * 20; // 20 minutes penalty per wrong attempt
            }, 0);
            
            return {
                user: participant.user,
                score: participant.score,
                solvedCount: participant.solvedProblems.length,
                totalTime,
                solvedProblems: participant.solvedProblems.map(sp => ({
                    problemId: sp.problemId,
                    solvedAt: sp.solvedAt,
                    attempts: sp.attempts
                }))
            };
        })
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Higher score first
            }
            return a.totalTime - b.totalTime; // Lower time first
        });
    
    return res.status(200).json(
        new ApiResponse(200, {
            contest: {
                title: contest.title,
                startTime: contest.startTime,
                endTime: contest.endTime,
                status: contest.status
            },
            leaderboard
        }, "Leaderboard fetched successfully")
    );
});

// Get public contests
export const getPublicContests = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status } = req.query;
    
    let filter = { isPublic: true };
    
    if (status) {
        filter.status = status;
    }
    
    const contests = await Contest.find(filter)
        .populate('createdBy', 'username fullName')
        .populate('problems.problemId', 'title difficulty')
        .select('-participants') // Don't include participants in public list
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
        }, "Public contests fetched successfully")
    );
});

// Get user's contest history
export const getUserContestHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const contests = await Contest.find({
        'participants.user': userId
    })
    .populate('createdBy', 'username fullName')
    .populate('problems.problemId', 'title difficulty')
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Contest.countDocuments({
        'participants.user': userId
    });
    
    // Add user's performance data
    const contestsWithPerformance = contests.map(contest => {
        const userParticipant = contest.participants.find(
            p => p.user.toString() === userId.toString()
        );
        
        return {
            ...contest.toObject(),
            userScore: userParticipant?.score || 0,
            userSolvedCount: userParticipant?.solvedProblems.length || 0,
            userRank: contest.participants
                .sort((a, b) => b.score - a.score)
                .findIndex(p => p.user.toString() === userId.toString()) + 1
        };
    });
    
    return res.status(200).json(
        new ApiResponse(200, {
            contests: contestsWithPerformance,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalContests: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "User contest history fetched successfully")
    );
});

