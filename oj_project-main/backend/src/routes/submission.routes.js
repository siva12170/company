import { Router } from "express";
import {
    submitCode,
    getUserSubmissions,
    getSubmissionById,
    getProblemSubmissions,
    getSubmissionStats
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Submit code for a problem
router.route("/submit").post(submitCode);

// Get all submissions for authenticated user
router.route("/").get(getUserSubmissions);

// Get submission statistics for authenticated user
router.route("/stats").get(getSubmissionStats);

// Get submissions for a specific problem
router.route("/problem/:problemId").get(getProblemSubmissions);

// Get specific submission by ID
router.route("/:submissionId").get(getSubmissionById);

export default router;
