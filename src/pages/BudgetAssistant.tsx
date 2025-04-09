
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBudget } from "@/context/BudgetContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

type Message = {
  _id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

const welcomeMessage = {
  _id: "welcome",
  content: "Hi there! I'm your Budget Buddy AI Assistant. How can I help with your finances today? You can ask me for spending insights, savings advice, or budgeting tips.",
  sender: "assistant",
  timestamp: new Date()
};

const BudgetAssistant = () => {
  const { balance, transactions, savingsGoals } = useBudget();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How am I spending this month?",
    "What should my budget look like?",
    "How can I reach my savings goals faster?",
    "How should I start investing?",
    "What's the best way to pay off my debt?"
  ];

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/assistant`);
      if (response.data.length > 0) {
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages([welcomeMessage, ...formattedMessages]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const tempUserMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages([...messages, tempUserMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/assistant`, {
        content: newMessage
      });

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempUserMessage._id);
        return [
          ...filtered,
          {
            ...response.data.userMessage,
            timestamp: new Date(response.data.userMessage.timestamp)
          },
          {
            ...response.data.aiMessage,
            timestamp: new Date(response.data.aiMessage.timestamp)
          }
        ];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        _id: crypto.randomUUID(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
                key={message._id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md ${
                      message.sender === "user" ? "bg-accent" : "bg-budget-primary"
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
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
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
