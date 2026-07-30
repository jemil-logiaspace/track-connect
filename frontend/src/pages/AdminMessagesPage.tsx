import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import ChatBox from "@/components/messaging/ChatBox";
import { getConversations, getMessages, sendMessage } from "@/api/conversations";
import { markMessagesAsRead } from "@/api/messages";
import { getDisputes, resolveDispute, Dispute } from "@/api/disputes";
import { MessageSquare, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  low: "bg-black/5 text-gray-500",
  medium: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground",
};

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    refetchInterval: 10000,
  });

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const { data: messages = [] } = useQuery({
    queryKey: ["conversation-messages", selectedId],
    queryFn: () => getMessages(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  const [resolveResponse, setResolveResponse] = useState("");

  const { data: trackingDisputes = [] } = useQuery({
    queryKey: ["tracking-disputes", selectedConv?.trackingId],
    queryFn: () => getDisputes(selectedConv!.trackingId),
    enabled: !!selectedConv && selectedConv?.type === "dispute",
  });

  const openDispute: Dispute | undefined = trackingDisputes.find(
    (d) => d.status === "open"
  );

  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!openDispute) return;
      await resolveDispute(selectedConv!.trackingId, openDispute.id, resolveResponse);
      await sendMessage(selectedId!, `✅ Dispute resolved: ${resolveResponse}`);
    },
    onSuccess: () => {
      toast.success("Dispute resolved");
      setResolveResponse("");
      queryClient.invalidateQueries({
        queryKey: ["tracking-disputes", selectedConv?.trackingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", selectedId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to resolve dispute"),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(selectedId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  const filtered = conversations.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (selectedId) {
      markMessagesAsRead(selectedId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      });
    }
  }, [selectedId, queryClient]);

  const chatMessages = messages.map((m) => ({
    id: m.id,
    senderId: m.senderId || "",
    senderName: m.sender?.name || (m.senderRole === "client" ? "Client" : "You"),
    senderRole: m.senderRole,
    content: m.body,
    timestamp: m.createdAt,
    read: m.readAt !== null,
  }));

  return (
    <DashboardLayout role="admin">
      <div className="flex h-full">
        <div className="w-80 border-r border-black/[0.04] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-black/[0.04] space-y-2">
            <h2 className="font-display font-semibold tracking-tight">Support</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search..."
                className="pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-4 border-b border-black/[0.04] hover:bg-black/5 transition-all duration-500 ease-out-expo ${
                  selectedId === conv.id ? "bg-black/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{conv.subject}</span>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-black/5 text-gray-600 border-0 text-xs rounded-full">{conv.unreadCount}</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono">{conv.trackingNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{conv.clientName}</span>
                    <Badge className={`${priorityColors[conv.priority]} border-0 text-[10px] rounded-full`}>{conv.priority}</Badge>
                    {conv.type === "dispute" && (
                      <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] flex items-center gap-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Dispute
                      </Badge>
                    )}
                  </div>
                <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-black/[0.04] bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold tracking-tight">{selectedConv.subject}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConv.trackingNumber} • {selectedConv.clientName}
                    </p>
                  </div>
                  <Badge className="bg-black/5 text-gray-600 border-0 rounded-full">Open</Badge>
                </div>
              </div>

              {selectedConv.type === "dispute" && (
                <div className="p-[1px] rounded-[2rem] bg-black/[0.03] mx-4 mt-4">
                  <div className="rounded-[calc(2rem-1px)] bg-white p-4 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] border border-destructive/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <h4 className="font-display font-semibold text-sm tracking-tight">Open Dispute</h4>
                    </div>
                    {openDispute ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{openDispute.reason}</p>
                        <p className="text-sm text-gray-500">
                          {openDispute.description}
                        </p>
                        <Textarea
                          placeholder="Resolve by explaining your decision..."
                          value={resolveResponse}
                          onChange={(e) => setResolveResponse(e.target.value)}
                          rows={2}
                        />
                        <Button
                          size="sm"
                          onClick={() => resolveMutation.mutate()}
                          disabled={
                            !resolveResponse.trim() || resolveMutation.isPending
                          }
                          className="w-full rounded-full"
                        >
                          {resolveMutation.isPending
                            ? "Resolving..."
                            : "Resolve Dispute"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle className="w-4 h-4" />
                        This dispute has been resolved.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0">
                <ChatBox
                  messages={chatMessages}
                  currentUserId="admin"
                  onSend={(content) => sendMutation.mutate(content)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-500" />
                <p>Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
