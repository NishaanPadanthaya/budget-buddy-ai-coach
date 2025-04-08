
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export type Transaction = {
  _id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  aiCategorized?: boolean;
  userId: string;
};

export type SavingsGoal = {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  date: Date;
  color: string;
  userId: string;
};

type BudgetContextType = {
  balance: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, "_id">) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "_id">) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  fetchTransactions: () => void;
  fetchSavingsGoals: () => void;
  isLoading: boolean;
  error: string | null;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Temporary user ID - in a real app, this would come from authentication
const TEMP_USER_ID = "6452a8d2e4b0a7c3d9f0b1a2";

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current balance from transactions
  const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/transactions/${TEMP_USER_ID}`);
      const transactionsWithDates = response.data.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date)
      }));
      setTransactions(transactionsWithDates);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching transactions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch savings goals from API
  const fetchSavingsGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/savings/${TEMP_USER_ID}`);
      const goalsWithDates = response.data.map((goal: any) => ({
        ...goal,
        date: new Date(goal.date)
      }));
      setSavingsGoals(goalsWithDates);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching savings goals");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (transaction: Omit<Transaction, "_id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/transactions`, {
        ...transaction,
        userId: TEMP_USER_ID
      });
      const newTransaction = {
        ...response.data,
        date: new Date(response.data.date)
      };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error adding transaction");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new savings goal
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "_id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/savings`, {
        ...goal,
        userId: TEMP_USER_ID
      });
      const newGoal = {
        ...response.data,
        date: new Date(response.data.date)
      };
      setSavingsGoals(prev => [...prev, newGoal]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error adding savings goal");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update savings goal amount
  const updateSavingsGoal = async (id: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${API_URL}/savings/${id}`, { amount });
      const updatedGoal = {
        ...response.data,
        date: new Date(response.data.date)
      };
      setSavingsGoals(prev => 
        prev.map(goal => goal._id === id ? updatedGoal : goal)
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating savings goal");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTransactions();
    fetchSavingsGoals();
  }, []);

  return (
    <BudgetContext.Provider
      value={{
        balance,
        transactions,
        savingsGoals,
        addTransaction,
        addSavingsGoal,
        updateSavingsGoal,
        fetchTransactions,
        fetchSavingsGoals,
        isLoading,
        error
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
