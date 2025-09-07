import { Router } from "express";
import {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getMyProblems
} from "../controllers/problem.controller.js";
import { verifyJWT, isProblemsetterOrAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllProblems); // Get all problems (public, but without test cases)

// Protected routes (require authentication)
router.use(verifyJWT); // Apply to all routes below

// Problemsetter/Admin only routes
router.route("/create").post(isProblemsetterOrAdmin, createProblem);
router.route("/my-problems").get(isProblemsetterOrAdmin, getMyProblems);

// Problem specific routes (must come after specialized routes to avoid conflicts)
router.route("/:id").get(getProblemById); // Get problem by ID (requires auth to see test cases)
router.route("/:id").put(isProblemsetterOrAdmin, updateProblem);
router.route("/:id").delete(isProblemsetterOrAdmin, deleteProblem);

export default router;
