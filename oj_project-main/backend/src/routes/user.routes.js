import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    checkAuth, 
    getUserProfile, 
    updateUserProfile, 
    getUserStats 
} from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(checkAuth);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/update-profile").put(verifyJWT, upload.single('avatar'), updateUserProfile);
router.route("/stats/:userId").get(getUserStats);
export default router;