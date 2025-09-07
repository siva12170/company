import mongoose from "mongoose"
const problemSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, "Please enter title"],
        index: true,
    },
    description: {
        type: String,
        required: [true, "Please give your markdown"]
    },
    difficulty: {
        type: String,
        enum: ['Easy', "Medium", "Hard", "Extreme"],
        default:'Easy',
        required: [true, "Please select difficulty"],
        index: true
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true,
        index: true
    }],
    timeLimit: {
        type: Number,
        required: true,
        validate: {
            validator: value => value > 0,
            message: "Time limit must be greater than 0"
        }
    },
    memoryLimit: {
        type: Number,
        required: true,
        validate: {
            validator: value => value > 0,
            message: "Memory limit must be greater than 0"
        }
    },
    testcases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        visible: {
            type: Boolean,
            default: false
        }
    }
    ]
},{ timestamps: true });

const Problem = mongoose.model('Problem', problemSchema)
export default Problem