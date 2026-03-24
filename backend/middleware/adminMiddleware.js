/**
 * adminMiddleware — checks that req.user.role === 'admin'
 * Must be used AFTER authMiddleware
 */
module.exports = function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admins only.' });
};
