import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useConversations, useUserProfile } from "../hooks/useQueries";

function ConversationItem({
  principal,
  index,
}: { principal: Principal; index: number }) {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile(principal);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() =>
        navigate({
          to: "/messages/$userId",
          params: { userId: principal.toString() },
        })
      }
      className="w-full flex items-center gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all text-left"
      data-ocid={`messages.conversation.item.${index + 1}`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <MessageSquare size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{userProfile?.name || "Usuario"}</p>
        <p className="text-xs text-muted-foreground truncate">
          {userProfile?.email || `${principal.toString().slice(0, 20)}...`}
        </p>
      </div>
      <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: conversations = [], isLoading } = useConversations();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="font-display text-3xl mb-6">Mensajes</h1>

      {isLoading ? (
        <div className="space-y-3" data-ocid="messages.loading_state">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div
          className="text-center py-16 bg-secondary rounded-2xl"
          data-ocid="messages.empty_state"
        >
          <MessageSquare
            size={48}
            className="mx-auto text-muted-foreground/30 mb-4"
          />
          <h3 className="font-display text-xl mb-2">Sin conversaciones</h3>
          <p className="text-muted-foreground text-sm">
            Cuando contactes a un profesional, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="messages.list">
          {conversations.map((principal, i) => (
            <ConversationItem
              key={principal.toString()}
              principal={principal}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
