const { verifyToken } = require("../utils");
const ErrorHandler = require("./ErrorHandlingClass");

const authMiddleware = async(req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if(!authHeader) {
            return next(new ErrorHandler("No token found",401))
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if(!decoded.id) {
            return next(new ErrorHandler("Invalid token",401));
        }
        req.id = decoded.id;
        next();
    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }
}

module.exports = authMiddleware;