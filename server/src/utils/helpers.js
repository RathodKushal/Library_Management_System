/**
 * Generate a unique membership ID (e.g., MEM-2026-00001)
 */
export function generateMembershipId(lastId = 0) {
  const year = new Date().getFullYear();
  const num = String(lastId + 1).padStart(5, '0');
  return `MEM-${year}-${num}`;
}

/**
 * Calculate fine for overdue books
 * Rate: $1 per day overdue
 */
export function calculateFine(dueDate, returnDate = new Date(), dailyRate = 1.0) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffTime = returned - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  return diffDays * dailyRate;
}

/**
 * Format date to ISO string for SQLite
 */
export function formatDate(date) {
  return new Date(date).toISOString();
}

/**
 * Calculate default due date (14 days from now)
 */
export function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString();
}

/**
 * Sanitize pagination parameters
 */
export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
