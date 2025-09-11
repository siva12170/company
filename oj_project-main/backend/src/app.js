import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import path from "path"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express() // instead of this use cors
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // max requests per IP per minute
}));

// Health check route (before other middleware)
app.use("/api/v1/healthcheck", healthcheckRouter)

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Set-Cookie"]
};

app.use(cors(corsOptions)) // using for defining the origin of the request
app.use(express.json({limit: "16kb"})) // using for parsing the json data
app.use(express.urlencoded({extended: true})) // using for parsing the form data (isse ham vo %20 ya + wali cheeze jo url me hoti h usse configure kr skte h) 
app.use(express.static("public")) // using for serving the static files
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser()) // using for parsing the cookies

// Remove the custom origin check middleware as CORS handles this
// app.use((req, res, next) => {
//   const origin = req.headers.origin || "";
//   const referer = req.headers.referer || "";
//   
//   if (origin.startsWith(process.env.CORS_ORIGIN) || 
//       referer.startsWith(process.env.CORS_ORIGIN)) {
//     return next();
//   }
//   res.status(403).json({ error: "Forbidden" });
// });

// Routes import
import userRouter from './routes/user.routes.js'
import problemRouter from "./routes/problem.routes.js"
import submissionRouter from "./routes/submission.routes.js"
import topicRoutes from './routes/topicRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import publicMessageRoutes from './routes/publicMessageRoutes.js';
import adminRouter from './routes/admin.routes.js';
import contestRouter from './routes/contest.routes.js';

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/problems", problemRouter)
app.use("/api/v1/submissions", submissionRouter)
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/public-messages", publicMessageRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/contests", contestRouter);

app.use((err, req, res, next) => {
    console.error("Error caught by middleware:", err);
    
    if (err.statusCode) {
        // This is an ApiError
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }
    
    // Generic error
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

export default app