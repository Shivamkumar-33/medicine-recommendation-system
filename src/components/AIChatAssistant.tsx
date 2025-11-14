import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI medical assistant. I can help answer general health questions, explain medical terms, and provide information about medications. However, I cannot diagnose conditions or replace professional medical advice. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Simple rule-based responses (in production, use actual AI)
    if (lowerInput.includes("symptom") || lowerInput.includes("pain") || lowerInput.includes("hurt")) {
      return "I understand you're experiencing symptoms. While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis and treatment. Would you like me to explain what you should discuss with your doctor?";
    }

    if (lowerInput.includes("medication") || lowerInput.includes("medicine") || lowerInput.includes("drug")) {
      return "I can provide general information about medications, but I cannot give specific medical advice. For questions about your medications, including dosages, side effects, or interactions, please consult your pharmacist or healthcare provider. What would you like to know?";
    }

    if (lowerInput.includes("emergency") || lowerInput.includes("urgent")) {
      return "If you're experiencing a medical emergency, please call emergency services (911) immediately. For urgent but non-emergency situations, contact your healthcare provider or visit an urgent care center.";
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return "Hello! I'm here to help with general health information. Remember, I'm not a replacement for professional medical advice. What would you like to know?";
    }

    if (lowerInput.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with regarding your health?";
    }

    return "Thank you for your question. I can provide general health information, but for specific medical concerns, diagnoses, or treatment recommendations, please consult with a qualified healthcare professional. How else can I assist you?";
  };

  const quickQuestions = [
    "What should I do if I miss a medication dose?",
    "How do I read my lab results?",
    "What are common side effects?",
    "When should I see a doctor?"
  ];

  return (
    <Card className="border-2 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="bg-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Health Assistant
        </CardTitle>
        <CardDescription>
          Ask general health questions (Not a replacement for medical advice)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setInput(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a health question..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

