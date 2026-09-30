import bcrypt from 'bcryptjs';
import { queryOne, run } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

export function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    
    const existing = queryOne('SELECT id FROM librarians WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A librarian with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = run('INSERT INTO librarians (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, role || 'librarian']);
    const user = queryOne('SELECT id, name, email, role, created_at FROM librarians WHERE id = ?', [result.lastInsertRowid]);
    const token = generateToken(user);

    res.status(201).json({ success: true, message: 'Librarian registered successfully.', data: { user, token } });
  } catch (error) { next(error); }
}

export function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = queryOne('SELECT * FROM librarians WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(user);
    const { password_hash, ...safe } = user;
    res.json({ success: true, message: 'Login successful.', data: { user: safe, token } });
  } catch (error) { next(error); }
}

export function getProfile(req, res, next) {
  try {
    const user = queryOne('SELECT id, name, email, role, created_at FROM librarians WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
}
