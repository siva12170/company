import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    problems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"problem"
    }],
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
})

const Contest = mongoose.model('Contest',contestSchema)
export default Contest