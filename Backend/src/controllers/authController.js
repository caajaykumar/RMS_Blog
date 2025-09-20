import jwt from 'jsonwebtoken';

// POST /api/auth/validate
export async function validateToken(req, res) {
  try {
    const authHeader = req.headers['authorization'] || '';
    let token = null;
    if (authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
    if (!token && req.cookies) token = req.cookies['token'];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration: JWT secret missing' });
    }

    const payload = jwt.verify(token, secret);
    return res.json({ success: true, message: 'Token valid', data: { user: payload } });
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message });
  }
}
