
import { BudgetProvider } from "@/context/BudgetContext";
import Dashboard from "./Dashboard";

const Index = () => {
  return (
    <BudgetProvider>
      <Dashboard />
    </BudgetProvider>
  );
};

export default Index;
