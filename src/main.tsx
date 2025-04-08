
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BudgetProvider } from './context/BudgetContext.tsx'

createRoot(document.getElementById("root")!).render(
  <BudgetProvider>
    <App />
  </BudgetProvider>
);
