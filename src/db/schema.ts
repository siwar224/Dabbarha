export const DATABASE_NAME = "dabbirha.db";

export const migrations = [
  `
  CREATE TABLE IF NOT EXISTS monthly_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    income REAL NOT NULL,
    plannedExpenses REAL NOT NULL,
    savingsTarget REAL NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    UNIQUE(month, year)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    isUnplanned INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    targetAmount REAL NOT NULL,
    initialSavedAmount REAL NOT NULL DEFAULT 0,
    targetDate TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS goal_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goalId INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    source TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    type TEXT NOT NULL
  );
  `
] as const;
