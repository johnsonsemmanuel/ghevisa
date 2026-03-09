"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  Download,
  Loader2,
  User,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

const suggestedQueries = [
  { icon: TrendingUp, text: "How many applications did we receive last month?", category: "Applications" },
  { icon: DollarSign, text: "What is the total revenue this week?", category: "Revenue" },
  { icon: Globe, text: "Which countries are most visitors coming from?", category: "Countries" },
  { icon: Users, text: "What is the current approval rate?", category: "Decisions" },
  { icon: Clock, text: "How many applications are pending review?", category: "Processing" },
  { icon: TrendingUp, text: "Show me visitor statistics for the last 7 days", category: "Analytics" },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant for the Ghana e-Visa System. I can help you with:\n\n- **Application statistics** (submitted, approved, denied)\n- **Revenue and payment data**\n- **Country/nationality breakdown**\n- **Processing times and SLA compliance**\n- **User registration data**\n\nJust ask me a question about your system data!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (query?: string) => {
    const questionText = query || input.trim();
    if (!questionText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: questionText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/admin/ai-assistant/query", { query: questionText });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.response || "I couldn't process that request. Please try again.",
        data: res.data.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleExport = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.data) return;

    try {
      // Find the corresponding user query
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const userQuery = messageIndex > 0 ? messages[messageIndex - 1].content : "";

      const response = await api.post(
        "/admin/ai-assistant/export",
        { query: userQuery },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ai_query_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <DashboardShell
      title="AI Support Assistant"
      description="Ask questions about your system data"
    >
      <div className="flex flex-col h-[calc(100vh-220px)] bg-white rounded-xl border border-border overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface border border-border rounded-bl-md"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-text-primary [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_strong]:font-semibold [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                {/* Export button for data responses */}
                {message.role === "assistant" && message.data && Object.keys(message.data).length > 1 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleExport(message.id)}
                      className="text-xs"
                    >
                      <Download size={14} className="mr-1" />
                      Export Data (CSV)
                    </Button>
                  </div>
                )}
                
                <p className="text-[10px] mt-2 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={18} className="text-primary" />
              </div>
              <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing your data...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm font-medium text-text-secondary">Try asking:</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(query.text)}
                  className="flex items-center gap-2 p-3 bg-surface hover:bg-surface/80 border border-border rounded-xl text-left text-sm transition-colors"
                >
                  <query.icon size={16} className="text-primary flex-shrink-0" />
                  <span className="text-text-primary line-clamp-2">{query.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about applications, revenue, countries, processing..."
                className="w-full px-4 py-3 pr-12 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <HelpCircle size={14} className="text-text-muted" />
            <p className="text-xs text-text-muted">
              Tip: Specify time periods like "last month", "this week", or "last 7 days" for more specific results
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
