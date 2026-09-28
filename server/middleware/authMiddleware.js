const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }
        const parts = authHeader.split(" ");
        if (parts[0]!== "Bearer" || !parts[1]){
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            })
        }
       

        const decoded = jwt.verify(
            parts[1],
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;