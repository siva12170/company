import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // isme validation nahi chaiye kyuki we know what we are doing
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}


export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password, accType } = req.body
    
    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }

    // Validate account type
    const validAccTypes = ["User", "Problemsetter", "Admin"];
    if (accType && !validAccTypes.includes(accType)) {
        throw new ApiError(400, "Invalid account type");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }
    // Create new user
    const newUser = await User.create({
        username,
        fullName,
        email,
        password,
        accType: accType || "User" // Default to "User" if not provided
    });
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went worng while creating a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    
    if (
        [email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Credentials are required")
    }

    // Find user by email
    const username = email;
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully")
        )
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from the document
            }
        },
        {
            new: true
        }
    )
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in production
    }
    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export const checkAuth = asyncHandler(async (req, res) => {
    let token = null;

    // try cookie first, then Authorization header
    if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.header("Authorization")) {
        // fix typo “Brearer” → “Bearer ”
        token = req.header("Authorization").replace(/^Bearer\s+/i, "");
    }

    if (!token) {
        return res.status(401).json(
            new ApiResponse(401, null, "No token provided", false)
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Get full user data from database
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        
        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, null, "User not found", false)
            );
        }

        return res.status(200).json(
            new ApiResponse(200, user, "Authentication successful")
        );
    } catch (error) {
        return res.status(401).json(
            new ApiResponse(401, null, "Invalid token", false)
        );
    }
})

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile fetched successfully")
    );
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, username, email, gender, location, website } = req.body;

    // Check if username or email already exists (excluding current user)
    if (username || email) {
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        ...(username ? [{ username }] : []),
                        ...(email ? [{ email }] : [])
                    ]
                }
            ]
        });

        if (existingUser) {
            throw new ApiError(400, "Username or email already exists");
        }
    }

    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (gender) updateData.gender = gender;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;

    // Handle avatar upload if provided
    if (req.file) {
        const avatarLocalPath = req.file?.path; 
        if (!avatarLocalPath) {
            return new ApiError(400, "Avatar file is missing")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading avatar")
        }
        const deleteResponce = await deleteFromCloudinary(req.user?.avatar)
        console.log(deleteResponce)
        updateData.avatar = avatar.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

export const getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // For now, return mock data since we don't have submissions implemented yet
    // In a real application, you would calculate these from the database
    const stats = {
        totalSubmissions: Math.floor(Math.random() * 100) + 20,
        acceptedSubmissions: "Comming Soon..",
        problemsSolved: "Comming Soon..",
        contestsParticipated: "Comming Soon..",
        ranking: "Comming Soon..",
        accuracyRate: "Comming Soon.."
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "User stats fetched successfully")
    );
})