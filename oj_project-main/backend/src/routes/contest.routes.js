import express from "express";
import {
    registerForContest,
    unregisterFromContest,
    getContestDetails,
    submitContestSolution,
    getContestLeaderboard,
    getPublicContests,
    getUserContestHistory
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.route("/public")
    .get(getPublicContests);

// ==================== PROTECTED ROUTES ====================
router.use(verifyJWT);

// Contest registration
router.route("/:contestId/register")
    .post(registerForContest);

router.route("/:contestId/unregister")
    .post(unregisterFromContest);

// Contest participation
router.route("/:contestId")
    .get(getContestDetails);

router.route("/:contestId/problems/:problemId/submit")
    .post(submitContestSolution);

// Leaderboard
router.route("/:contestId/leaderboard")
    .get(getContestLeaderboard);

// User contest history
router.route("/user/history")
    .get(getUserContestHistory);

export default router;


