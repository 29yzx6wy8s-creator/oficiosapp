import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMessages,
  useSendMessage,
  useUserProfile,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2"];

export function ConversationPage() {
  const { userId } = useParams({ from: "/messages/$userId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  let otherPrincipal: Principal | null = null;
  try {
    otherPrincipal = Principal.fromText(userId);
  } catch {
    // invalid principal
  }

  const { data: messages = [], isLoading } = useMessages(otherPrincipal);
  const { data: otherProfile } = useUserProfile(otherPrincipal);
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change is intentional
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !otherPrincipal) return;
    try {
      await sendMessage.mutateAsync({
        recipient: otherPrincipal,
        content: message.trim(),
      });
      setMessage("");
    } catch {
      toast.error("Error al enviar el mensaje");
    }
  };

  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <div
      className="container mx-auto px-4 py-4 max-w-xl flex flex-col"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/messages" })}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          data-ocid="conversation.back.button"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {(otherProfile?.name || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm">
            {otherProfile?.name || "Usuario"}
          </p>
          <p className="text-xs text-muted-foreground">
            {otherProfile?.email || ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="conversation.loading_state">
            {SKELETON_KEYS.map((k, i) => (
              <Skeleton
                key={k}
                className={`h-10 w-2/3 rounded-2xl ${i % 2 ? "ml-auto" : ""}`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="conversation.empty_state"
          >
            <p className="text-sm">
              Inicia la conversación enviando un mensaje
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMine = msg.sender.toString() === myPrincipal;
              return (
                <motion.div
                  key={msg.id.toString()}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                    >
                      {new Date(
                        Number(msg.timestamp) / 1_000_000,
                      ).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 flex-shrink-0 pt-2 border-t border-border"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          autoComplete="off"
          data-ocid="conversation.message.input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || sendMessage.isPending}
          data-ocid="conversation.send.button"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
