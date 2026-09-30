import { getDb, queryAll } from './src/config/database.js';

async function runTest() {
  await getDb();
  console.log('Books:', queryAll("SELECT id FROM books"));
  console.log('Transactions:', queryAll("SELECT id, book_id, member_id FROM transactions"));
}

runTest();
