
import { BarChart, PieChart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudget } from "@/context/BudgetContext";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { balance, transactions, savingsGoals } = useBudget();
  
  // Calculate total income and expenses for the current month
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Get top spending categories
  const categories = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Calculate savings progress
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const currentSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const savingsProgress = totalSavingsTarget > 0 ? (currentSavings / totalSavingsTarget) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="flex items-baseline">
              <DollarSign className="text-budget-primary mr-1" size={18} />
              <span className="text-2xl font-bold">{balance.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="flex items-baseline">
              <ArrowUpRight className="text-green-500 mr-1" size={18} />
              <span className="text-2xl font-bold">${income.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground">This month</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="flex items-baseline">
              <ArrowDownRight className="text-red-500 mr-1" size={18} />
              <span className="text-2xl font-bold">${expenses.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground">This month</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Progress</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="flex items-baseline mb-2">
              <TrendingUp className="text-budget-primary mr-1" size={18} />
              <span className="text-2xl font-bold">{savingsProgress.toFixed(0)}%</span>
            </div>
            <Progress value={savingsProgress} className="h-2" />
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground">${currentSavings.toFixed(2)} of ${totalSavingsTarget.toFixed(2)}</p>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Spending Breakdown</CardTitle>
              <PieChart className="text-muted-foreground" size={20} />
            </div>
            <CardDescription>Your top spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-budget-primary opacity-80"></div>
                    <span>{category}</span>
                  </div>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              AI detected that your top category is{" "}
              <span className="font-medium">
                {topCategories.length > 0 ? topCategories[0][0] : "N/A"}
              </span>
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Savings Goals</CardTitle>
              <BarChart className="text-muted-foreground" size={20} />
            </div>
            <CardDescription>Track your progress towards your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{goal.name}</span>
                    <span className="text-sm">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={(goal.currentAmount / goal.targetAmount) * 100} 
                    className="h-2" 
                    style={{ backgroundColor: goal.color + '40' }} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">
                {savingsGoals.length > 0 
                  ? savingsGoals.reduce((closest, goal) => {
                      const closestDays = Math.floor((closest.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const goalDays = Math.floor((goal.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return closestDays < goalDays ? closest : goal;
                    }, savingsGoals[0]).name 
                  : "No"
                }
              </span>{" "}
              goal coming up next
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest 5 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
