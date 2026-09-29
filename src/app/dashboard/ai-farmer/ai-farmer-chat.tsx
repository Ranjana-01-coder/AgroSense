

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { aiFarmer } from "@/ai/flows/ai-farmer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAgroStore } from "@/lib/store";
import { useTranslation } from "@/lib/translation";

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});
type FormData = z.infer<typeof chatSchema>;

type Message = {
  role: "user" | "model";
  content: string;
};

export function AIFarmerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { language } = useAgroStore();
  const { t } = useTranslation();

  const form = useForm<FormData>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const onSubmit = async (data: FormData) => {
    const userMessage: Message = { role: "user", content: data.message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    form.reset();
    setIsLoading(true);

    try {
      const result = await aiFarmer({
        history: newMessages,
        language,
      });
      const modelMessage: Message = {
        role: "model",
        content: result.response,
      };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (error) {
      console.error("AI Farmer error:", error);
      toast({
        variant: "destructive",
        title: t('aiFarmer.errorTitle'),
        description: t('aiFarmer.errorDescription'),
      });
      // Revert to the state before sending the message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground pt-16">
                    <Bot className="h-12 w-12 mx-auto" />
                    <p className="mt-4">{t('aiFarmer.askAnything')}</p>
                </div>
            ) : messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : ""
                )}
              >
                {message.role === "model" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-md rounded-lg px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
                 {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <Input
              {...form.register("message")}
              placeholder={t('aiFarmer.askInLanguage', { language })}
              autoComplete="off"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} size="icon" className="cursor-pointer">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
