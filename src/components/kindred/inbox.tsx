import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { otherParticipant, relativeTime } from "@/lib/kindred/format";
import { YOU_ID } from "@/lib/kindred/seed";
import { lastMessage, threadPreview, useKindred } from "@/lib/kindred/store";
import { Avatar, Button, Empty, Field } from "./ui";
import { cn } from "@/lib/utils";

export function InboxView() {
  const threads = useKindred((s) => s.threads);
  const messages = useKindred((s) => s.messages);
  const members = useKindred((s) => s.members);
  const push = useKindred((s) => s.push);

  const rows = threads
    .map((t) => ({ thread: t, ...threadPreview(t, messages, members, YOU_ID) }))
    .sort((a, b) => (b.last?.createdAt ?? 0) - (a.last?.createdAt ?? 0));

  return (
    <div className="scroll-y h-full px-4 pb-6 pt-2">
      {rows.length === 0 ? (
        <Empty title="No messages yet" body="Open a profile and start a conversation." />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ thread, other, last }) => {
            if (!other) return null;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => push({ name: "thread", id: thread.id })}
                className="glass flex items-center gap-3 rounded-2xl p-3 text-left"
              >
                <Avatar initials={other.initials} tone={other.tone} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-medium">{other.name}</p>
                    {last ? (
                      <span className="shrink-0 text-micro text-subtle">{relativeTime(last.createdAt)}</span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-muted">{last?.body ?? "Say hello"}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ThreadView({ id }: { id: string }) {
  const thread = useKindred((s) => s.threads.find((t) => t.id === id));
  const messages = useKindred((s) => s.messages.filter((m) => m.threadId === id));
  const members = useKindred((s) => s.members);
  const pop = useKindred((s) => s.pop);
  const push = useKindred((s) => s.push);
  const sendMessage = useKindred((s) => s.sendMessage);
  const [text, setText] = useState("");

  if (!thread) {
    return (
      <div className="p-6">
        <Empty title="Conversation missing" body="Try starting a new one from a profile." />
      </div>
    );
  }

  const otherId = otherParticipant(thread.participantIds, YOU_ID);
  const other = members.find((m) => m.id === otherId);
  const latest = lastMessage(id, messages);

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={pop} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        {other ? (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2"
            onClick={() => push({ name: "person", id: other.id })}
          >
            <Avatar initials={other.initials} tone={other.tone} size="sm" />
            <span className="truncate text-sm font-medium">{other.name}</span>
          </button>
        ) : (
          <span className="flex-1 text-sm">Thread</span>
        )}
      </header>
      <div className="scroll-y flex flex-1 flex-col gap-2 px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Start the conversation.</p>
        ) : (
          messages.map((m) => {
            const mine = m.authorId === YOU_ID;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "msg-bubble rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    mine ? "bg-accent text-accent-fg rounded-br-md" : "glass rounded-bl-md",
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        {latest ? <p className="pt-1 text-center text-micro text-subtle">{relativeTime(latest.createdAt)}</p> : null}
      </div>
      <form
        className="flex gap-2 px-4 pt-2 safe-pad-bottom"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(id, text);
          setText("");
        }}
      >
        <Field
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Send" disabled={!text.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
