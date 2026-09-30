import { queryAll, run } from '../config/database.js';

export function getSettings(req, res, next) {
  try {
    const settingsRows = queryAll('SELECT * FROM settings');
    const settings = {};
    settingsRows.forEach(s => {
      settings[s.key] = s.value;
    });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

export function updateSettings(req, res, next) {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, String(value)]);
    }
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) { next(error); }
}

export function resetFines(req, res, next) {
  try {
    run('UPDATE transactions SET fine_amount = 0');
    res.json({ success: true, message: 'All fines have been reset to 0.' });
  } catch (error) { next(error); }
}
