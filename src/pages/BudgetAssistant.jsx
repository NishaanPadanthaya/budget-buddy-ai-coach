
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const API_URL = "http://localhost:5000/api";

// Define Message type
const welcomeMessage = {
  _id: "welcome",
  content: "Hi there! I'm your Budget Buddy AI Assistant. How can I help with your finances today? You can ask me for spending insights, savings advice, or budgeting tips.",
  sender: "assistant",
  timestamp: new Date()
};

const BudgetAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([welcomeMessage]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch previous messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/assistant/messages`);
        if (response.data.length > 0) {
          // Convert timestamps to Date objects
          const formattedMessages = response.data.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages([welcomeMessage, ...formattedMessages]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Scroll to bottom when messages update
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

    setMessages(prev => [...prev, tempUserMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/assistant/chat`, {
        message: newMessage
      });

      // Remove temporary message
      setMessages(prev => prev.filter(msg => msg._id !== tempUserMessage._id));
      
      // Add both user and AI messages returned from the API
      setMessages(prev => [
        ...prev,
        {
          ...response.data.userMessage,
          timestamp: new Date(response.data.userMessage.timestamp)
        },
        {
          ...response.data.aiMessage,
          timestamp: new Date(response.data.aiMessage.timestamp)
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        _id: crypto.randomUUID(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: "assistant",
        timestamp: new Date()
      };
      
      // Remove temporary message and add error message
      setMessages(prev => prev.filter(msg => msg._id !== tempUserMessage._id));
      setMessages(prev => [...prev, tempUserMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="min-h-[75vh] max-h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle>Budget AI Assistant</CardTitle>
          <CardDescription>
            Ask your AI assistant about your finances, budgeting tips, or savings advice
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 p-4 overflow-hidden">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="px-1">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="tips">Financial Tips</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:mt-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div 
                      key={message._id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        <div className="break-words whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === "user" 
                            ? "text-primary-foreground/80" 
                            : "text-muted-foreground"
                        }`}>
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="pt-4 relative">
                <Textarea
                  placeholder="Ask a question about your finances..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] resize-none pr-16"
                  disabled={isLoading}
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-6 right-4"
                  onClick={handleSendMessage}
                  disabled={isLoading || !newMessage.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tips" className="flex-1 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  <h3 className="text-lg font-semibold">Financial Tips</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Track your expenses regularly to understand your spending patterns.</li>
                    <li>Create a budget and stick to it - aim to save at least 20% of your income.</li>
                    <li>Build an emergency fund covering 3-6 months of expenses.</li>
                    <li>Pay off high-interest debt first, such as credit cards.</li>
                    <li>Set specific savings goals to stay motivated.</li>
                    <li>Consider automating your savings to ensure consistency.</li>
                    <li>Review your subscriptions and cancel those you don't use.</li>
                    <li>Try the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.</li>
                  </ul>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetAssistant;
