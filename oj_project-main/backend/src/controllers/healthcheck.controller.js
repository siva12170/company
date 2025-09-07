import asyncHandler from "../utils/AsyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json({status:"OK"})
})


export default healthcheck;