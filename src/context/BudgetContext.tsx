
import React, { createContext, useState, useContext, ReactNode } from "react";

// Mock data for initial state
const initialTransactions = [
  {
    id: "1",
    date: new Date(2025, 3, 1),
    amount: -85.25,
    category: "Food & Dining",
    description: "Grocery Store",
    aiCategorized: true
  },
  {
    id: "2",
    date: new Date(2025, 3, 2),
    amount: -45.00,
    category: "Entertainment",
    description: "Movie Tickets",
    aiCategorized: true
  },
  {
    id: "3",
    date: new Date(2025, 3, 3),
    amount: -125.50,
    category: "Shopping",
    description: "Department Store",
    aiCategorized: true
  },
  {
    id: "4",
    date: new Date(2025, 3, 4),
    amount: 2400.00,
    category: "Income",
    description: "Salary Deposit",
    aiCategorized: false
  },
  {
    id: "5",
    date: new Date(2025, 3, 5),
    amount: -55.20,
    category: "Transportation",
    description: "Gas Station",
    aiCategorized: true
  },
  {
    id: "6",
    date: new Date(2025, 3, 6),
    amount: -22.50,
    category: "Food & Dining",
    description: "Coffee Shop",
    aiCategorized: true
  },
  {
    id: "7",
    date: new Date(2025, 3, 7),
    amount: -750.00,
    category: "Housing",
    description: "Rent Payment",
    aiCategorized: false
  }
];

const initialSavingsGoals = [
  {
    id: "1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 2500,
    date: new Date(2025, 9, 1),
    color: "#14B8A6"
  },
  {
    id: "2",
    name: "Vacation",
    targetAmount: 3000,
    currentAmount: 750,
    date: new Date(2025, 7, 15),
    color: "#0D9488"
  },
  {
    id: "3",
    name: "New Laptop",
    targetAmount: 1500,
    currentAmount: 900,
    date: new Date(2025, 5, 20),
    color: "#0F766E"
  }
];

export type Transaction = {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  aiCategorized?: boolean;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  date: Date;
  color: string;
};

type BudgetContextType = {
  balance: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);

  // Calculate current balance from transactions
  const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  // Add new transaction
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  // Add new savings goal
  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
    };
    setSavingsGoals([...savingsGoals, newGoal]);
  };

  // Update savings goal amount
  const updateSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals(
      savingsGoals.map((goal) =>
        goal.id === id
          ? { ...goal, currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) }
          : goal
      )
    );
  };

  return (
    <BudgetContext.Provider
      value={{
        balance,
        transactions,
        savingsGoals,
        addTransaction,
        addSavingsGoal,
        updateSavingsGoal,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};
