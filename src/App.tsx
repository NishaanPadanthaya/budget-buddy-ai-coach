
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { BudgetProvider } from "./context/BudgetContext";
import AppLayout from "./components/layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Savings from "./pages/Savings";
import Settings from "./pages/Settings";
import BudgetAssistant from "./pages/BudgetAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BudgetProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="savings" element={<Savings />} />
              <Route path="assistant" element={<BudgetAssistant />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BudgetProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
