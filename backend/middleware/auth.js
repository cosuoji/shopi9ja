import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token;

  // 1. Check Authorization Header (Bearer TOKEN)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: Check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not authorized, token missing',
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload to request
    req.user = decoded; // Contains { id, email }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Not authorized, token invalid or expired',
    });
  }
};

export { protect };
