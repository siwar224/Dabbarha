import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

import { DATABASE_NAME, DATABASE_VERSION, migrations } from "@/db/schema";
import type {
  SetupAllocation,
  SetupCategoryBudget,
  SetupData,
  SetupGoal,
  SetupGoalInput,
  SetupIncomeEntry,
  SetupMonthlyPlan,
  SetupRecurringExpense,
  SetupTransaction
} from "@/types/setup";

const LEGACY_STORAGE_KEY = "dabbirha.setup.v1";
const MIGRATED_LEGACY_KEY = "legacyAsyncStorageMigrated";

type SettingRow = {
  value: string;
};

type AllocationRow = {
  id: string;
  label: string;
  amount: number;
  icon: SetupAllocation["icon"];
  tone: SetupAllocation["tone"];
};

type MonthlyPlanRow = {
  month: number;
  year: number;
  income: number;
  advance: number;
};

type MonthlyAllocationRow = AllocationRow & {
  month: number;
  year: number;
};

type CategoryBudgetRow = {
  month: number;
  year: number;
  category: SetupCategoryBudget["category"];
  amount: number;
};

type IncomeEntryRow = SetupIncomeEntry;
type RecurringExpenseRow = SetupRecurringExpense;

type GoalRow = {
  id: string | number;
  title: string;
  targetAmount: number;
  savedAmount?: number;
  initialSavedAmount?: number;
  targetDate?: string | null;
  imageUri?: string | null;
  isPrimary?: number;
};

type TransactionRow = {
  id: string | number;
  amount: number;
  category: SetupTransaction["category"];
  date: string;
  note?: string | null;
  isUnplanned: number;
  createdAt: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let migrationPromise: Promise<void> | null = null;

async function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME);
  const database = await databasePromise;

  migrationPromise ??= migrateDatabase(database);
  await migrationPromise;

  return database;
}

async function migrateDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync("PRAGMA foreign_keys = ON;");

  for (const migration of migrations) {
    await database.execAsync(migration);
  }

  await ensureColumn(database, "goals", "savedAmount", "REAL NOT NULL DEFAULT 0");
  await ensureColumn(database, "goals", "imageUri", "TEXT");
  await ensureColumn(database, "goals", "isPrimary", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(database, "monthly_plans", "advance", "REAL NOT NULL DEFAULT 0");
  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}

async function ensureColumn(database: SQLite.SQLiteDatabase, tableName: string, columnName: string, definition: string) {
  const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
  if (!columns.some((column) => column.name === columnName)) {
    await database.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

function parseNumber(value: string | undefined, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getMonthKey(month: number, year: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getMonthParts(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return { year, month: month - 1 };
}

async function getSetting(database: SQLite.SQLiteDatabase, key: string) {
  const row = await database.getFirstAsync<SettingRow>("SELECT value FROM app_settings WHERE key = ?;", key);
  return row?.value;
}

async function setSetting(database: SQLite.SQLiteDatabase, key: string, value: string) {
  await database.runAsync(
    "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
    key,
    value
  );
}

function mapGoalRow(row: GoalRow): SetupGoal {
  return {
    id: String(row.id),
    title: row.title,
    targetAmount: row.targetAmount,
    savedAmount: row.savedAmount ?? row.initialSavedAmount ?? 0,
    targetDate: row.targetDate ?? undefined,
    imageUri: row.imageUri ?? undefined
  };
}

function mapTransactionRow(row: TransactionRow): SetupTransaction {
  return {
    id: String(row.id),
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    isUnplanned: Boolean(row.isUnplanned),
    createdAt: row.createdAt
  };
}

function normalizeLegacySetupData(defaultData: SetupData, rawData: unknown): SetupData {
  const parsed = rawData as Partial<SetupData>;
  const goals = parsed.goals ?? (parsed.goal ? [parsed.goal] : []);

  return {
    ...defaultData,
    ...parsed,
    advance: parsed.advance ?? defaultData.advance,
    monthlyPlans: parsed.monthlyPlans ?? [],
    goals,
    goal: parsed.goal ?? goals[0],
    goalSkipped: parsed.goalSkipped ?? false,
    transactions: parsed.transactions ?? []
  };
}

async function persistSetupSnapshot(database: SQLite.SQLiteDatabase, data: SetupData) {
  await database.withTransactionAsync(async () => {
    await setSetting(database, "income", String(data.income));
    await setSetting(database, "advance", String(data.advance));
    await setSetting(database, "goalSkipped", String(data.goalSkipped));
    await setSetting(database, "primaryGoalId", data.goal?.id ?? "");

    await database.runAsync("DELETE FROM monthly_allocations;");
    for (const [index, allocation] of data.allocations.entries()) {
      await database.runAsync(
        `INSERT INTO monthly_allocations (id, label, amount, icon, tone, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?);`,
        allocation.id,
        allocation.label,
        allocation.amount,
        allocation.icon,
        allocation.tone,
        index
      );
    }

    const currentDate = new Date();
    await upsertMonthlyPlanRows(database, data.monthlyPlans[0] ?? {
      monthKey: getMonthKey(currentDate.getMonth(), currentDate.getFullYear()),
      income: data.income,
      advance: data.advance,
      allocations: data.allocations,
      categoryBudgets: data.categoryBudgets
    });

    await database.runAsync("DELETE FROM goals;");
    for (const goal of data.goals) {
      await upsertGoalRow(database, goal, goal.id === data.goal?.id);
    }

    await database.runAsync("DELETE FROM transactions;");
    for (const transaction of data.transactions) {
      await insertTransactionRow(database, transaction);
    }

    await database.runAsync("DELETE FROM income_entries;");
    for (const entry of data.incomeEntries) {
      await database.runAsync(
        `INSERT INTO income_entries (id, monthKey, type, amount, date, note, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        entry.id,
        entry.monthKey,
        entry.type,
        entry.amount,
        entry.date,
        entry.note ?? null,
        entry.createdAt
      );
    }

    await database.runAsync("DELETE FROM recurring_expenses;");
    for (const recurring of data.recurringExpenses) {
      await database.runAsync(
        `INSERT INTO recurring_expenses (id, amount, category, note, intervalDays, nextDate, endDate, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        recurring.id,
        recurring.amount,
        recurring.category,
        recurring.note ?? null,
        recurring.intervalDays,
        recurring.nextDate,
        recurring.endDate ?? null,
        recurring.createdAt
      );
    }
  });
}

async function migrateLegacyStorageIfNeeded(database: SQLite.SQLiteDatabase, defaultData: SetupData) {
  const migrated = await getSetting(database, MIGRATED_LEGACY_KEY);
  if (migrated === "true") {
    return;
  }

  const existingIncome = await getSetting(database, "income");
  if (existingIncome !== undefined) {
    await setSetting(database, MIGRATED_LEGACY_KEY, "true");
    return;
  }

  const legacyData = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyData) {
    await persistSetupSnapshot(database, normalizeLegacySetupData(defaultData, JSON.parse(legacyData)));
  }

  await setSetting(database, MIGRATED_LEGACY_KEY, "true");
}

async function upsertGoalRow(database: SQLite.SQLiteDatabase, goal: SetupGoal, isPrimary: boolean) {
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO goals (id, title, targetAmount, savedAmount, targetDate, imageUri, isPrimary, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       targetAmount = excluded.targetAmount,
       savedAmount = excluded.savedAmount,
       targetDate = excluded.targetDate,
       imageUri = excluded.imageUri,
       isPrimary = excluded.isPrimary,
       updatedAt = excluded.updatedAt;`,
    goal.id,
    goal.title,
    goal.targetAmount,
    goal.savedAmount,
    goal.targetDate ?? null,
    goal.imageUri ?? null,
    isPrimary ? 1 : 0,
    now,
    now
  );
}

async function insertTransactionRow(database: SQLite.SQLiteDatabase, transaction: SetupTransaction | TransactionRow) {
  await database.runAsync(
    `INSERT OR REPLACE INTO transactions (id, amount, category, date, note, isUnplanned, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    transaction.id,
    transaction.amount,
    transaction.category,
    transaction.date,
    transaction.note ?? null,
    transaction.isUnplanned ? 1 : 0,
    transaction.createdAt
  );
}

async function upsertMonthlyPlanRows(database: SQLite.SQLiteDatabase, plan: SetupMonthlyPlan) {
  const { month, year } = getMonthParts(plan.monthKey);
  const now = new Date().toISOString();
  const plannedExpenses = plan.allocations
    .filter((allocation) => allocation.id !== "saving")
    .reduce((sum, allocation) => sum + allocation.amount, 0);
  const savingsTarget = plan.allocations.find((allocation) => allocation.id === "saving")?.amount ?? 0;

  await database.runAsync(
    `INSERT INTO monthly_plans (month, year, income, advance, plannedExpenses, savingsTarget, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(month, year) DO UPDATE SET
       income = excluded.income,
       advance = excluded.advance,
       plannedExpenses = excluded.plannedExpenses,
       savingsTarget = excluded.savingsTarget,
       updatedAt = excluded.updatedAt;`,
    month,
    year,
    plan.income,
    plan.advance,
    plannedExpenses,
    savingsTarget,
    now,
    now
  );

  await database.runAsync("DELETE FROM monthly_plan_allocations WHERE month = ? AND year = ?;", month, year);
  for (const [index, allocation] of plan.allocations.entries()) {
    await database.runAsync(
      `INSERT INTO monthly_plan_allocations (month, year, id, label, amount, icon, tone, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      month,
      year,
      allocation.id,
      allocation.label,
      allocation.amount,
      allocation.icon,
      allocation.tone,
      index
    );
  }

  await database.runAsync("DELETE FROM monthly_category_budgets WHERE month = ? AND year = ?;", month, year);
  for (const budget of plan.categoryBudgets) {
    await database.runAsync(
      `INSERT INTO monthly_category_budgets (month, year, category, amount)
       VALUES (?, ?, ?, ?);`,
      month,
      year,
      budget.category,
      budget.amount
    );
  }
}

function mapIncomeEntryRow(row: IncomeEntryRow): SetupIncomeEntry {
  return {
    id: String(row.id),
    monthKey: row.monthKey,
    type: row.type,
    amount: row.amount,
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.createdAt
  };
}

function mapRecurringExpenseRow(row: RecurringExpenseRow): SetupRecurringExpense {
  return {
    id: String(row.id),
    amount: row.amount,
    category: row.category,
    note: row.note ?? undefined,
    intervalDays: row.intervalDays,
    nextDate: row.nextDate,
    endDate: row.endDate ?? undefined,
    createdAt: row.createdAt
  };
}

function addDays(value: string, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

async function materializeRecurringExpenses(
  database: SQLite.SQLiteDatabase,
  recurringRows: RecurringExpenseRow[],
  transactionRows: TransactionRow[]
) {
  const now = new Date();

  for (const recurring of recurringRows) {
    let nextDate = new Date(recurring.nextDate);
    let occurrence = 0;
    while (nextDate <= now && occurrence < 366) {
      if (!recurring.endDate || nextDate <= new Date(recurring.endDate)) {
        const id = `${recurring.id}-${nextDate.toISOString().slice(0, 10)}`;
        if (!transactionRows.some((transaction) => String(transaction.id) === id)) {
          const generatedTransaction = {
            id,
            amount: recurring.amount,
            category: recurring.category,
            date: nextDate.toISOString(),
            note: recurring.note,
            isUnplanned: 0,
            createdAt: nextDate.toISOString()
          } satisfies TransactionRow;
          transactionRows.push(generatedTransaction);
          await insertTransactionRow(database, generatedTransaction);
        }
      }
      nextDate = addDays(nextDate.toISOString(), Math.max(recurring.intervalDays, 1));
      occurrence += 1;
    }

    await database.runAsync(
      "UPDATE recurring_expenses SET nextDate = ? WHERE id = ?;",
      nextDate.toISOString(),
      recurring.id
    );
  }
}

export async function loadSetupData(defaultData: SetupData): Promise<SetupData> {
  const database = await getDatabase();
  await migrateLegacyStorageIfNeeded(database, defaultData);

  const [incomeValue, advanceValue, goalSkippedValue, primaryGoalIdValue, allocationRows, monthlyPlanRows, monthlyAllocationRows, categoryBudgetRows, incomeEntryRows, recurringExpenseRows, goalRows, transactionRows] =
    await Promise.all([
      getSetting(database, "income"),
      getSetting(database, "advance"),
      getSetting(database, "goalSkipped"),
      getSetting(database, "primaryGoalId"),
      database.getAllAsync<AllocationRow>(
        "SELECT id, label, amount, icon, tone FROM monthly_allocations ORDER BY sortOrder ASC;"
      ),
      database.getAllAsync<MonthlyPlanRow>(
        "SELECT month, year, income, advance FROM monthly_plans ORDER BY year ASC, month ASC;"
      ),
      database.getAllAsync<MonthlyAllocationRow>(
        "SELECT month, year, id, label, amount, icon, tone FROM monthly_plan_allocations ORDER BY year ASC, month ASC, sortOrder ASC;"
      ),
      database.getAllAsync<CategoryBudgetRow>(
        "SELECT month, year, category, amount FROM monthly_category_budgets ORDER BY year ASC, month ASC;"
      ),
      database.getAllAsync<IncomeEntryRow>(
        "SELECT id, monthKey, type, amount, date, note, createdAt FROM income_entries ORDER BY createdAt DESC;"
      ),
      database.getAllAsync<RecurringExpenseRow>(
        "SELECT id, amount, category, note, intervalDays, nextDate, endDate, createdAt FROM recurring_expenses ORDER BY createdAt DESC;"
      ),
      database.getAllAsync<GoalRow>(
        "SELECT id, title, targetAmount, savedAmount, targetDate, imageUri, isPrimary FROM goals ORDER BY updatedAt DESC;"
      ),
      database.getAllAsync<TransactionRow>(
        "SELECT id, amount, category, date, note, isUnplanned, createdAt FROM transactions ORDER BY createdAt DESC;"
      )
    ]);

  await materializeRecurringExpenses(database, recurringExpenseRows, transactionRows);

  const goals = goalRows.map(mapGoalRow);
  const primaryGoal =
    goals.find((goal) => goal.id === primaryGoalIdValue) ??
    goals.find((goal, index) => goalRows[index]?.isPrimary === 1);

  const legacyIncome = parseNumber(incomeValue, defaultData.income);
  const legacyAdvance = parseNumber(advanceValue, defaultData.advance);
  const legacyAllocations = allocationRows.length > 0 ? allocationRows : defaultData.allocations;
  const allocationsByMonth = new Map<string, SetupAllocation[]>();
  for (const allocation of monthlyAllocationRows) {
    const key = getMonthKey(allocation.month, allocation.year);
    const current = allocationsByMonth.get(key) ?? [];
    current.push({
      id: allocation.id,
      label: allocation.label,
      amount: allocation.amount,
      icon: allocation.icon,
      tone: allocation.tone
    });
    allocationsByMonth.set(key, current);
  }
  const categoryBudgetsByMonth = new Map<string, SetupCategoryBudget[]>();
  for (const budget of categoryBudgetRows) {
    const key = getMonthKey(budget.month, budget.year);
    const current = categoryBudgetsByMonth.get(key) ?? [];
    current.push({ category: budget.category, amount: budget.amount });
    categoryBudgetsByMonth.set(key, current);
  }

  const mappedIncomeEntries = incomeEntryRows.map(mapIncomeEntryRow);
  const monthlyPlans = monthlyPlanRows.map((row) => ({
    monthKey: getMonthKey(row.month, row.year),
    income: row.income,
    advance: row.advance ?? 0,
    allocations: allocationsByMonth.get(getMonthKey(row.month, row.year)) ?? legacyAllocations,
    categoryBudgets: categoryBudgetsByMonth.get(getMonthKey(row.month, row.year)) ?? defaultData.categoryBudgets
  }));
  const currentDate = new Date();
  const currentMonthKey = getMonthKey(currentDate.getMonth(), currentDate.getFullYear());
  const currentPlan = monthlyPlans.find((plan) => plan.monthKey === currentMonthKey) ?? {
    monthKey: currentMonthKey,
    income: legacyIncome,
    advance: legacyAdvance,
    allocations: legacyAllocations,
    categoryBudgets: defaultData.categoryBudgets
  };
  const currentAdvance = mappedIncomeEntries
    .filter((entry) => entry.monthKey === currentMonthKey && entry.type === "advance")
    .reduce((sum, entry) => sum + entry.amount, 0);
  if (currentAdvance > 0) {
    currentPlan.advance = currentAdvance;
  }
  if (!monthlyPlans.some((plan) => plan.monthKey === currentMonthKey)) {
    monthlyPlans.unshift(currentPlan);
    await upsertMonthlyPlanRows(database, currentPlan);
  }

  return {
    ...defaultData,
    income: currentPlan.income,
    advance: currentPlan.advance,
    allocations: currentPlan.allocations,
    monthlyPlans,
    categoryBudgets: currentPlan.categoryBudgets,
    incomeEntries: mappedIncomeEntries,
    recurringExpenses: recurringExpenseRows.map(mapRecurringExpenseRow),
    goal: goalSkippedValue === "true" ? undefined : primaryGoal,
    goals,
    goalSkipped: goalSkippedValue === "true",
    transactions: transactionRows.map(mapTransactionRow)
  };
}

export async function saveIncome(income: number) {
  const database = await getDatabase();
  await setSetting(database, "income", String(income));
}

export async function saveMonthlyPlan(plan: SetupMonthlyPlan) {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await upsertMonthlyPlanRows(database, plan);
  });
}

export async function saveIncomeEntry(entry: SetupIncomeEntry) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO income_entries (id, monthKey, type, amount, date, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    entry.id,
    entry.monthKey,
    entry.type,
    entry.amount,
    entry.date,
    entry.note ?? null,
    entry.createdAt
  );
}

export async function saveRecurringExpense(recurring: SetupRecurringExpense) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO recurring_expenses (id, amount, category, note, intervalDays, nextDate, endDate, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    recurring.id,
    recurring.amount,
    recurring.category,
    recurring.note ?? null,
    recurring.intervalDays,
    recurring.nextDate,
    recurring.endDate ?? null,
    recurring.createdAt
  );
}

export async function deleteRecurringExpense(id: string) {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM recurring_expenses WHERE id = ?;", id);
}

export async function updateTransaction(transaction: SetupTransaction) {
  const database = await getDatabase();
  await insertTransactionRow(database, transaction);
}

export async function deleteTransaction(id: string) {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM transactions WHERE id = ?;", id);
}

export async function saveAllocations(allocations: SetupAllocation[]) {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM monthly_allocations;");

    for (const [index, allocation] of allocations.entries()) {
      await database.runAsync(
        `INSERT INTO monthly_allocations (id, label, amount, icon, tone, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?);`,
        allocation.id,
        allocation.label,
        allocation.amount,
        allocation.icon,
        allocation.tone,
        index
      );
    }
  });
}

export async function savePrimaryGoal(goal: SetupGoal, goals: SetupGoal[]) {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync("UPDATE goals SET isPrimary = 0;");
    for (const item of goals) {
      await upsertGoalRow(database, item, item.id === goal.id);
    }
    await setSetting(database, "primaryGoalId", goal.id);
    await setSetting(database, "goalSkipped", "false");
  });
}

export async function saveGoal(goal: SetupGoal, isPrimary: boolean) {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    if (isPrimary) {
      await database.runAsync("UPDATE goals SET isPrimary = 0;");
      await setSetting(database, "primaryGoalId", goal.id);
    }

    await upsertGoalRow(database, goal, isPrimary);
    await setSetting(database, "goalSkipped", "false");
  });
}

export async function saveUpdatedGoal(goalId: string, goal: SetupGoalInput) {
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE goals
     SET title = ?, targetAmount = ?, savedAmount = ?, targetDate = ?, imageUri = ?, updatedAt = ?
     WHERE id = ?;`,
    goal.title,
    goal.targetAmount,
    goal.savedAmount,
    goal.targetDate ?? null,
    goal.imageUri ?? null,
    new Date().toISOString(),
    goalId
  );
}

export async function saveGoalContribution(goalId: string, amount: number, date: string, source: string) {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ id: number }>(
    "SELECT id FROM goal_contributions WHERE goalId = ? AND source = ? LIMIT 1;",
    goalId,
    source
  );
  if (existing) {
    return false;
  }

  await database.runAsync(
    `INSERT INTO goal_contributions (goalId, amount, date, source, createdAt)
     VALUES (?, ?, ?, ?, ?);`,
    goalId,
    amount,
    date,
    source,
    new Date().toISOString()
  );
  return true;
}

export async function saveGoalSkipped() {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await setSetting(database, "goalSkipped", "true");
    await setSetting(database, "primaryGoalId", "");
    await database.runAsync("UPDATE goals SET isPrimary = 0;");
  });
}

export async function saveTransaction(transaction: SetupTransaction) {
  const database = await getDatabase();
  await insertTransactionRow(database, transaction);
}
