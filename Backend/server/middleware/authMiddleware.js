const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing or invalid token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains userId
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
