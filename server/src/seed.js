import bcrypt from 'bcryptjs';
import { initializeDatabase, queryOne, run } from './config/database.js';

async function seed() {
  console.log('🌱 Seeding database...\n');
  await initializeDatabase();

  // Clear existing data
  run('DELETE FROM transactions');
  run('DELETE FROM books');
  run('DELETE FROM members');
  run('DELETE FROM categories');
  run('DELETE FROM librarians');
  run('DELETE FROM sqlite_sequence');

  // 1. Librarians
  run('INSERT INTO librarians (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@gmail.com', bcrypt.hashSync('admin123', 10), 'admin']);
  run('INSERT INTO librarians (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Priya Sharma', 'priya@reactra.edu', bcrypt.hashSync('librarian123', 10), 'librarian']);
  console.log('  ✅ Librarians created (admin@gmail.com / admin123)');

  // 2. Categories
  const categories = [
    ['Computer Science', 'Programming, algorithms, data structures', '#6366F1'],
    ['Mathematics', 'Pure and applied mathematics', '#8B5CF6'],
    ['Physics', 'Classical and quantum physics', '#06B6D4'],
    ['Literature', 'Classic and modern fiction', '#F59E0B'],
    ['History', 'World history and civilizations', '#EF4444'],
    ['Business', 'Management, economics, finance', '#10B981'],
    ['Engineering', 'Mechanical, electrical, civil', '#F97316'],
    ['Biology', 'Cell biology, genetics, ecology', '#84CC16'],
    ['Philosophy', 'Ethics, logic, metaphysics', '#EC4899'],
    ['Psychology', 'Cognitive science and behavior', '#14B8A6']
  ];
  categories.forEach(c => run('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)', c));
  console.log('  ✅ 10 categories created');

  // 3. Books
  const books = [
    ['Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 1, 'MIT Press', 2009, 5],
    ['Clean Code', 'Robert C. Martin', '978-0132350884', 1, 'Prentice Hall', 2008, 4],
    ['Design Patterns', 'Gang of Four', '978-0201633610', 1, 'Addison-Wesley', 1994, 3],
    ['The Pragmatic Programmer', 'David Thomas', '978-0135957059', 1, 'Addison-Wesley', 2019, 3],
    ['JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 1, "O'Reilly", 2008, 4],
    ['SICP', 'Harold Abelson', '978-0262510875', 1, 'MIT Press', 1996, 2],
    ['Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', 2, 'Cengage', 2015, 6],
    ['Linear Algebra Done Right', 'Sheldon Axler', '978-3319110790', 2, 'Springer', 2014, 3],
    ['Probability and Statistics', 'Morris DeGroot', '978-0321500465', 2, 'Pearson', 2012, 4],
    ['Fundamentals of Physics', 'David Halliday', '978-1118230718', 3, 'Wiley', 2013, 5],
    ['Quantum Mechanics', 'David J. Griffiths', '978-1107189638', 3, 'Cambridge', 2018, 3],
    ['Classical Mechanics', 'John R. Taylor', '978-1891389221', 3, 'University Science', 2005, 2],
    ['To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 4, 'Harper Perennial', 1960, 4],
    ['1984', 'George Orwell', '978-0451524935', 4, 'Signet Classics', 1949, 5],
    ['The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 4, 'Scribner', 1925, 3],
    ['Pride and Prejudice', 'Jane Austen', '978-0141439518', 4, 'Penguin', 1813, 3],
    ['A Brief History of Time', 'Stephen Hawking', '978-0553380163', 5, 'Bantam', 1988, 4],
    ['Sapiens', 'Yuval Noah Harari', '978-0062316097', 5, 'Harper', 2014, 5],
    ['The Lean Startup', 'Eric Ries', '978-0307887894', 6, 'Crown Business', 2011, 3],
    ['Thinking, Fast and Slow', 'Daniel Kahneman', '978-0374533557', 10, 'FSG', 2011, 4],
    ['The Art of Electronics', 'Paul Horowitz', '978-0521809269', 7, 'Cambridge', 2015, 2],
    ['Molecular Biology of the Cell', 'Bruce Alberts', '978-0815344322', 8, 'Garland', 2014, 3],
    ['The Republic', 'Plato', '978-0140455113', 9, 'Penguin', -380, 2],
    ['Psychology: Themes', 'Wayne Weiten', '978-1337408219', 10, 'Cengage', 2017, 4],
    ['Data Structures in Java', 'Robert Lafore', '978-0672324536', 1, 'Sams', 2002, 3],
  ];
  books.forEach(b => run('INSERT INTO books (title, author, isbn, category_id, publisher, year, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [...b, b[6]]));
  console.log('  ✅ 25 books created');

  // 4. Members
  const members = [
    ['Rahul Kumar', 'rahul@student.edu', '9876543210', 'Mumbai', 'MEM-2026-00001'],
    ['Sneha Patel', 'sneha@student.edu', '9876543211', 'Delhi', 'MEM-2026-00002'],
    ['Amit Singh', 'amit@student.edu', '9876543212', 'Bangalore', 'MEM-2026-00003'],
    ['Kavya Reddy', 'kavya@student.edu', '9876543213', 'Hyderabad', 'MEM-2026-00004'],
    ['Vikram Joshi', 'vikram@student.edu', '9876543214', 'Pune', 'MEM-2026-00005'],
    ['Ananya Nair', 'ananya@student.edu', '9876543215', 'Chennai', 'MEM-2026-00006'],
    ['Rohan Gupta', 'rohan@student.edu', '9876543216', 'Kolkata', 'MEM-2026-00007'],
    ['Pooja Mehta', 'pooja@student.edu', '9876543217', 'Ahmedabad', 'MEM-2026-00008'],
    ['Arjun Das', 'arjun@student.edu', '9876543218', 'Jaipur', 'MEM-2026-00009'],
    ['Meera Iyer', 'meera@student.edu', '9876543219', 'Lucknow', 'MEM-2026-00010'],
    ['Siddharth Roy', 'sid@student.edu', '9876543220', 'Chandigarh', 'MEM-2026-00011'],
    ['Divya Sharma', 'divya@student.edu', '9876543221', 'Bhopal', 'MEM-2026-00012'],
  ];
  members.forEach(m => run('INSERT INTO members (name, email, phone, address, membership_id) VALUES (?, ?, ?, ?, ?)', m));
  console.log('  ✅ 12 members created');

  // 5. Transactions
  function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
  function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); }

  const active = [
    [1, 1, 1, daysAgo(5), daysFromNow(9)],
    [2, 2, 1, daysAgo(3), daysFromNow(11)],
    [7, 3, 1, daysAgo(10), daysFromNow(4)],
    [10, 4, 2, daysAgo(7), daysFromNow(7)],
    [14, 5, 1, daysAgo(12), daysFromNow(2)],
    [19, 6, 2, daysAgo(8), daysFromNow(6)],
    // Overdue
    [3, 7, 1, daysAgo(20), daysAgo(6)],
    [13, 8, 2, daysAgo(18), daysAgo(4)],
    [18, 9, 1, daysAgo(25), daysAgo(11)],
  ];
  active.forEach(t => {
    run("INSERT INTO transactions (book_id, member_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, 'issued')", t);
    run('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [t[0]]);
  });

  const returned = [
    [4, 1, 1, daysAgo(30), daysAgo(16), daysAgo(15), 0],
    [5, 2, 2, daysAgo(25), daysAgo(11), daysAgo(10), 0],
    [6, 3, 1, daysAgo(28), daysAgo(14), daysAgo(12), 0],
    [8, 4, 1, daysAgo(35), daysAgo(21), daysAgo(18), 0],
    [9, 5, 2, daysAgo(22), daysAgo(8), daysAgo(7), 0],
    [11, 6, 1, daysAgo(40), daysAgo(26), daysAgo(24), 0],
    [15, 10, 1, daysAgo(45), daysAgo(31), daysAgo(35), 4.0],
    [17, 11, 2, daysAgo(50), daysAgo(36), daysAgo(33), 0],
    [20, 12, 1, daysAgo(20), daysAgo(6), daysAgo(3), 0],
  ];
  returned.forEach(t => run("INSERT INTO transactions (book_id, member_id, issued_by, issue_date, due_date, return_date, fine_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'returned')", t));

  console.log('  ✅ 18 transactions created (9 active, 3 overdue, 9 returned)');
  console.log('\n🎉 Database seeded!\n  📧 Email: admin@gmail.com\n  🔑 Password: admin123\n');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
