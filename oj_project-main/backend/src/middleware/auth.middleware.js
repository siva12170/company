import  User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = null;

  // try cookie first, then Authorization header
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.header("Authorization")) {
    // fix typo “Brearer” → “Bearer ”
    token = req.header("Authorization").replace(/^Bearer\s+/i, "");
  }

  if (!token) {
    throw new ApiError(401, "Unauthorized: no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  // fetch the user (without sensitive fields)
  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(401, "Invalid access token: user not found");
  }

  req.user = user;
  next();
});

export const isAdmin = (req, res, next) => {
  if (req.user.accType != "Admin") {
    throw new ApiError(403, "Forbidden: admin access required");
  }
  next();
};

export const isProblemsetterOrAdmin = (req, res, next) => {
  if (req.user.accType !== "Problemsetter" && req.user.accType !== "Admin") {
    throw new ApiError(403, "Forbidden: problemsetter or admin access required");
  }
  next();
};
