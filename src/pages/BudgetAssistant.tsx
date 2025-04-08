
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBudget } from "@/context/BudgetContext";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

// Sample welcome message
const welcomeMessage: Message = {
  id: "welcome",
  content: "Hi there! I'm your Budget Buddy AI Assistant. How can I help with your finances today? You can ask me for spending insights, savings advice, or budgeting tips.",
  sender: "assistant",
  timestamp: new Date(),
};

// Sample responses for the AI assistant
const sampleResponses: Record<string, string> = {
  spending: "Based on your recent transactions, your highest spending category is Food & Dining at $107.75 this month. This is about 15% higher than last month. Would you like some tips on how to reduce your food expenses?",
  budget: "Looking at your spending patterns, I recommend allocating 50% of your income to necessities, 30% to discretionary spending, and 20% to savings. Based on your income, that would be $1,200 for necessities, $720 for wants, and $480 for savings each month.",
  savings: "You're making great progress on your Emergency Fund goal! At your current rate, you'll reach your target in about 5 months. To speed this up, consider setting up an automatic weekly transfer of $50, which would help you reach your goal 6 weeks sooner.",
  investing: "For beginning investors, I recommend starting with low-cost index funds or ETFs. These provide broad market exposure with minimal fees. Based on your savings goals and risk profile, a mix of 70% stock funds and 30% bond funds could be appropriate.",
  debt: "Looking at your accounts, focusing on paying off your credit card debt first would save you the most money due to its high interest rate of 18%. If you can increase your monthly payment by just $50, you could be debt-free 8 months sooner and save $320 in interest.",
  default: "I'll analyze your financial data to provide personalized insights. To give you the most accurate advice, I'd need to know more about your specific financial situation and goals. What aspect of your finances would you like help with?"
};

const getAIResponse = (message: string): Promise<string> => {
  // This function simulates AI response generation
  return new Promise((resolve) => {
    // Convert message to lowercase for easy matching
    const lowercaseMessage = message.toLowerCase();
    
    // Check for keywords to determine response
    let response = "";
    if (lowercaseMessage.includes("spend") || lowercaseMessage.includes("spending") || lowercaseMessage.includes("expense")) {
      response = sampleResponses.spending;
    } else if (lowercaseMessage.includes("budget") || lowercaseMessage.includes("allocation")) {
      response = sampleResponses.budget;
    } else if (lowercaseMessage.includes("save") || lowercaseMessage.includes("saving") || lowercaseMessage.includes("goal")) {
      response = sampleResponses.savings;
    } else if (lowercaseMessage.includes("invest") || lowercaseMessage.includes("stock") || lowercaseMessage.includes("fund")) {
      response = sampleResponses.investing;
    } else if (lowercaseMessage.includes("debt") || lowercaseMessage.includes("loan") || lowercaseMessage.includes("credit")) {
      response = sampleResponses.debt;
    } else {
      response = sampleResponses.default;
    }
    
    // Simulate network delay
    setTimeout(() => {
      resolve(response);
    }, 1000);
  });
};

const BudgetAssistant = () => {
  const { balance, transactions, savingsGoals } = useBudget();
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Suggested questions for the user
  const suggestedQuestions = [
    "How am I spending this month?",
    "What should my budget look like?",
    "How can I reach my savings goals faster?",
    "How should I start investing?",
    "What's the best way to pay off my debt?"
  ];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(newMessage);
      
      // Add AI response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
  };
  
  return (
    <div className="animate-fade-in h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">AI Budget Assistant</h1>
      </div>
      
      <div className="flex-1 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-budget-primary/10 p-2 rounded-md">
              <Sparkles className="h-5 w-5 text-budget-primary" />
            </div>
            <div>
              <h2 className="font-medium">Budget Buddy AI</h2>
              <p className="text-sm text-muted-foreground">
                Powered by AI to help you manage your finances
              </p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md ${
                      message.sender === "user"
                        ? "bg-accent"
                        : "bg-budget-primary"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-5 w-5 text-accent-foreground" />
                    ) : (
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-budget-primary">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg px-4 py-3 text-sm bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start h-auto py-2 px-3 text-left"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-budget-primary" />
                  <span className="truncate">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t mt-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Ask Budget Buddy anything about your finances..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Budget Buddy AI helps you analyze your finances and provides personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetAssistant;
