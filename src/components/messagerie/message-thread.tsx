"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { envoyerMessage } from "@/server/actions/messagerie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { MessageRow } from "@/server/queries/messagerie";

type Props = {
  conversationId: string;
  currentUserId: string;
  messagesInitiaux: MessageRow[];
};

export function MessageThread({ conversationId, currentUserId, messagesInitiaux }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(messagesInitiaux);
  const [texte, setTexte] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom quand nouveaux messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscription Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageRow]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  function handleEnvoyer() {
    if (!texte.trim()) return;
    const contenu = texte.trim();
    setTexte("");

    startTransition(async () => {
      await envoyerMessage(conversationId, contenu);
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const estMoi = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  estMoi
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 border rounded-bl-sm shadow-sm"
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-1 ${estMoi ? "text-green-100" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("fr-SN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t bg-white px-4 py-3 flex gap-2">
        <Input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris un message…"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleEnvoyer()}
          className="flex-1"
        />
        <Button
          onClick={handleEnvoyer}
          disabled={isPending || !texte.trim()}
          className="bg-green-600 hover:bg-green-700"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
