import { queryAll, queryOne, run } from '../config/database.js';
import { getPagination, generateMembershipId } from '../utils/helpers.js';

export function getAllMembers(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, status } = req.query;
    let where = '1=1'; const params = [];
    if (search) { where += ' AND (m.name LIKE ? OR m.email LIKE ? OR m.membership_id LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
    if (status) { where += ' AND m.status = ?'; params.push(status); }
    const { total } = queryOne(`SELECT COUNT(*) as total FROM members m WHERE ${where}`, params) || { total: 0 };
    const members = queryAll(`SELECT m.*, (SELECT COUNT(*) FROM transactions t WHERE t.member_id = m.id AND t.status = 'issued') as active_loans FROM members m WHERE ${where} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    res.json({ success: true, data: members, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

export function getMemberById(req, res, next) {
  try {
    const member = queryOne('SELECT * FROM members WHERE id = ?', [Number(req.params.id)]);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    const transactions = queryAll('SELECT t.*, b.title as book_title, b.author as book_author, l.name as librarian_name FROM transactions t JOIN books b ON t.book_id = b.id JOIN librarians l ON t.issued_by = l.id WHERE t.member_id = ? ORDER BY t.created_at DESC LIMIT 20', [Number(req.params.id)]);
    const { active_loans } = queryOne("SELECT COUNT(*) as active_loans FROM transactions WHERE member_id = ? AND status = 'issued'", [Number(req.params.id)]) || { active_loans: 0 };
    const { total_fines } = queryOne('SELECT COALESCE(SUM(fine_amount), 0) as total_fines FROM transactions WHERE member_id = ?', [Number(req.params.id)]) || { total_fines: 0 };
    res.json({ success: true, data: { ...member, transactions, active_loans, total_fines } });
  } catch (error) { next(error); }
}

export function createMember(req, res, next) {
  try {
    const { name, email, phone, address, enrollment_no } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    if (enrollment_no) {
      const existingEnrollment = queryOne('SELECT id FROM members WHERE enrollment_no = ?', [enrollment_no]);
      if (existingEnrollment) return res.status(400).json({ success: false, message: 'Enrollment number is already in use.' });
    }
    const last = queryOne('SELECT MAX(id) as maxId FROM members');
    const membershipId = generateMembershipId(last?.maxId || 0);
    const result = run('INSERT INTO members (name, email, phone, address, enrollment_no, membership_id) VALUES (?, ?, ?, ?, ?, ?)', [name, email || null, phone || null, address || null, enrollment_no || null, membershipId]);
    const member = queryOne('SELECT * FROM members WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Member registered successfully.', data: member });
  } catch (error) { next(error); }
}

export function updateMember(req, res, next) {
  try {
    const existing = queryOne('SELECT * FROM members WHERE id = ?', [Number(req.params.id)]);
    if (!existing) return res.status(404).json({ success: false, message: 'Member not found.' });
    const { name, email, phone, address, status, enrollment_no } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    if (enrollment_no) {
      const existingEnrollment = queryOne('SELECT id FROM members WHERE enrollment_no = ? AND id != ?', [enrollment_no, Number(req.params.id)]);
      if (existingEnrollment) return res.status(400).json({ success: false, message: 'Enrollment number is already in use by another student.' });
    }
    const params = [
      name === undefined ? null : name,
      email === undefined ? null : email,
      phone === undefined ? null : phone,
      address === undefined ? null : address,
      status === undefined ? null : status,
      enrollment_no === undefined ? null : enrollment_no,
      Number(req.params.id)
    ];
    run('UPDATE members SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), address=COALESCE(?,address), status=COALESCE(?,status), enrollment_no=COALESCE(?,enrollment_no) WHERE id=?', params);
    const member = queryOne('SELECT * FROM members WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Member updated successfully.', data: member });
  } catch (error) { next(error); }
}

export function deleteMember(req, res, next) {
  try {
    const member = queryOne('SELECT * FROM members WHERE id = ?', [Number(req.params.id)]);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    const active = queryOne("SELECT id FROM transactions WHERE member_id = ? AND status = 'issued'", [Number(req.params.id)]);
    if (active) return res.status(400).json({ success: false, message: 'Cannot delete member with active loans.' });
    run('DELETE FROM members WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Member deleted successfully.' });
  } catch (error) { next(error); }
}
