import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    problems: [{
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        points: {
            type: Number,
            default: 100,
            min: 1
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        score: {
            type: Number,
            default: 0
        },
        solvedProblems: [{
            problemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem"
            },
            solvedAt: Date,
            points: Number,
            attempts: {
                type: Number,
                default: 0
            }
        }]
    }],
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "ended"],
        default: "upcoming"
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    maxParticipants: {
        type: Number,
        default: null
    }
}, { timestamps: true });

// Index for better query performance
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ "participants.user": 1 });

// Virtual for checking if contest is active
contestSchema.virtual('isActive').get(function() {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
});

// Method to update contest status
contestSchema.methods.updateStatus = function() {
    const now = new Date();
    if (now < this.startTime) {
        this.status = "upcoming";
    } else if (now >= this.startTime && now <= this.endTime) {
        this.status = "ongoing";
    } else {
        this.status = "ended";
    }
    return this.save();
};

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;