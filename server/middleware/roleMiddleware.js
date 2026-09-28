const roleMiddleware = (allowedRole) => {
    return (req, res, next) => {
        if (req.user.role !== allowedRole) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;