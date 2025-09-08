import express from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createUser,
    changeUserRole,
    getAllProblemsAdmin,
    updateProblemAdmin,
    deleteProblem,
    createContest,
    getAllContests,
    updateContest,
    deleteContest,
    getDashboardStats
} from "../controllers/admin.controller.js";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply JWT verification and admin check to all routes
router.use(verifyJWT);
router.use(isAdmin);

// ==================== USER MANAGEMENT ROUTES ====================
router.route("/users")
    .get(getAllUsers)
    .post(createUser);

router.route("/users/:userId")
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.route("/users/:userId/role")
    .put(changeUserRole);

// ==================== PROBLEM MANAGEMENT ROUTES ====================
router.route("/problems")
    .get(getAllProblemsAdmin);

router.route("/problems/:problemId")
    .put(updateProblemAdmin)
    .delete(deleteProblem);

// ==================== CONTEST MANAGEMENT ROUTES ====================
router.route("/contests")
    .get(getAllContests)
    .post(createContest);

router.route("/contests/:contestId")
    .put(updateContest)
    .delete(deleteContest);

// ==================== DASHBOARD ROUTES ====================
router.route("/dashboard/stats")
    .get(getDashboardStats);

export default router;

