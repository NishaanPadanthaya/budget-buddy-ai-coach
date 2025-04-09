import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

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
  addTransaction: (transaction: Omit<Transaction, "_id" | "userId">) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "_id" | "userId">) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  fetchTransactions: () => void;
  fetchSavingsGoals: () => void;
  isLoading: boolean;
  error: string | null;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current balance from transactions
  const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      const transactionsWithDates = response.data.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date)
      }));
      setTransactions(transactionsWithDates);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error fetching transactions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch savings goals from API
  const fetchSavingsGoals = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/savings`);
      const goalsWithDates = response.data.map((goal: any) => ({
        ...goal,
        date: new Date(goal.date)
      }));
      setSavingsGoals(goalsWithDates);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error fetching savings goals";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (transaction: Omit<Transaction, "_id" | "userId">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/transactions`, transaction);
      const newTransaction = {
        ...response.data,
        date: new Date(response.data.date)
      };
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error adding transaction";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new savings goal
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "_id" | "userId">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/savings`, goal);
      const newGoal = {
        ...response.data,
        date: new Date(response.data.date)
      };
      setSavingsGoals(prev => [...prev, newGoal]);
      toast({
        title: "Success",
        description: "Savings goal added successfully",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error adding savings goal";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
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
      toast({
        title: "Success",
        description: "Savings goal updated successfully",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error updating savings goal";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
      fetchSavingsGoals();
    }
  }, [isAuthenticated]);

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
