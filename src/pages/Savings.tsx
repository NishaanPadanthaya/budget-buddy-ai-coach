
import { useState } from "react";
import { 
  BarChart3, 
  Plus, 
  Calendar, 
  Circle, 
  LucideIcon,
  CheckCircle2,
  Timer,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { useBudget, SavingsGoal } from "@/context/BudgetContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const colors = [
  "#14B8A6",
  "#0D9488",
  "#0F766E",
  "#0369A1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#EAB308",
];

interface GoalCardProps {
  goal: SavingsGoal;
  onContribute: (id: string, amount: number) => void;
}

const GoalCard = ({ goal, onContribute }: GoalCardProps) => {
  const [amount, setAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const { toast } = useToast();
  
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const daysLeft = Math.max(0, Math.floor((goal.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  const handleContribute = () => {
    const contributionAmount = parseFloat(amount);
    if (!amount || isNaN(contributionAmount) || contributionAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    onContribute(goal.id, contributionAmount);
    setAmount("");
    setIsContributing(false);
    
    toast({
      title: "Contribution added",
      description: `$${contributionAmount.toFixed(2)} added to ${goal.name}`,
    });
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{goal.name}</CardTitle>
            <CardDescription>Target: ${goal.targetAmount.toFixed(2)}</CardDescription>
          </div>
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${goal.currentAmount.toFixed(2)}</span>
              <span>${goal.targetAmount.toFixed(2)}</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              style={{ backgroundColor: `${goal.color}40` }} 
              indicatorColor={goal.color}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span>{daysLeft} days left</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{progress.toFixed(0)}% complete</span>
            </div>
          </div>
          
          {isContributing ? (
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setIsContributing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={handleContribute}
                >
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsContributing(true)}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Goal Completed
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Contribute
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">
          Target date: {format(goal.date, "MMM d, yyyy")}
        </p>
      </CardFooter>
    </Card>
  );
};

const SavingsGoalForm = ({ onClose }: { onClose: () => void }) => {
  const { addSavingsGoal } = useBudget();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startingAmount, setStartingAmount] = useState("0");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !targetAmount) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const target = parseFloat(targetAmount);
    const starting = parseFloat(startingAmount || "0");
    
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(starting) || starting < 0) {
      toast({
        title: "Invalid starting amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (starting > target) {
      toast({
        title: "Invalid amounts",
        description: "Starting amount cannot be greater than the target",
        variant: "destructive",
      });
      return;
    }
    
    addSavingsGoal({
      name,
      targetAmount: target,
      currentAmount: starting,
      date: selectedDate,
      color: selectedColor,
    });
    
    toast({
      title: "Savings goal created",
      description: `${name} with a target of $${target.toFixed(2)}`,
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          placeholder="e.g., Vacation, Emergency Fund"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Target Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="target"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="pl-8"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="starting">Starting Amount (Optional)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="starting"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="pl-8"
            value={startingAmount}
            onChange={(e) => setStartingAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Target Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                selectedColor === color ? "ring-2 ring-offset-2 ring-ring" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Circle className="h-5 w-5 text-white fill-current" />
              )}
            </button>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Create Goal</Button>
      </DialogFooter>
    </form>
  );
};

const Savings = () => {
  const { savingsGoals, updateSavingsGoal } = useBudget();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const totalSavings = savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0);
  const targetSavings = savingsGoals.reduce((total, goal) => total + goal.targetAmount, 0);
  const overallProgress = targetSavings > 0 ? (totalSavings / targetSavings) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
              <DialogDescription>
                Set up a new savings goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <SavingsGoalForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-budget-primary" />
            Overall Progress
          </CardTitle>
          <CardDescription>
            ${totalSavings.toFixed(2)} of ${targetSavings.toFixed(2)} saved across all goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {savingsGoals.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No savings goals yet</h3>
          <p className="text-muted-foreground mb-4">
            Set up your first savings goal to start tracking your progress.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onContribute={updateSavingsGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Savings;
