import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reactra-library-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export { JWT_SECRET };
