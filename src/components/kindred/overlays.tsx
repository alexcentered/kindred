import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useKindred } from "@/lib/kindred/store";
import { Button, Empty, Field, SectionLabel } from "./ui";
import { PostCard } from "./post-card";
import { Avatar } from "./ui";
import { relativeTime } from "@/lib/kindred/format";

export function SearchOverlay() {
  const close = useKindred((s) => s.closeOverlay);
  const posts = useKindred((s) => s.posts);
  const members = useKindred((s) => s.members);
  const groups = useKindred((s) => s.groups);
  const push = useKindred((s) => s.push);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return { posts: posts.slice(0, 4), members: members.slice(0, 4), groups: groups.slice(0, 4) };
    return {
      posts: posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.body.toLowerCase().includes(query) ||
          p.topics.some((t) => t.includes(query)) ||
          p.location.toLowerCase().includes(query),
      ),
      members: members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.skills.some((s) => s.toLowerCase().includes(query)) ||
          m.neighborhood.toLowerCase().includes(query),
      ),
      groups: groups.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.purpose.toLowerCase().includes(query) ||
          g.neighborhood.toLowerCase().includes(query),
      ),
    };
  }, [query, posts, members, groups]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-bg-elevated">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={close} aria-label="Close search">
          <ArrowLeft className="size-5" />
        </Button>
        <Field
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills, people, groups"
          className="flex-1"
        />
      </header>
      <div className="scroll-y flex-1 px-4 pb-10">
        <SectionLabel>People</SectionLabel>
        <div className="mt-2 mb-5 flex flex-col gap-2">
          {results.members.length === 0 ? (
            <p className="text-sm text-muted">No people match.</p>
          ) : (
            results.members.map((m) => (
              <button
                key={m.id}
                type="button"
                className="glass flex items-center gap-3 rounded-2xl p-3 text-left"
                onClick={() => {
                  close();
                  push({ name: "person", id: m.id });
                }}
              >
                <Avatar initials={m.initials} tone={m.tone} />
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-subtle">
                    {m.neighborhood} · {m.skills.slice(0, 2).join(", ")}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
        <SectionLabel>Groups</SectionLabel>
        <div className="mt-2 mb-5 flex flex-col gap-2">
          {results.groups.length === 0 ? (
            <p className="text-sm text-muted">No groups match.</p>
          ) : (
            results.groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="glass rounded-2xl p-3 text-left"
                onClick={() => {
                  close();
                  push({ name: "group", id: g.id });
                }}
              >
                <p className="font-medium">{g.name}</p>
                <p className="text-xs text-subtle">{g.neighborhood}</p>
              </button>
            ))
          )}
        </div>
        <SectionLabel>Posts</SectionLabel>
        <div className="mt-3 flex flex-col gap-3">
          {results.posts.length === 0 ? (
            <Empty title="No posts" body="Try a skill, a neighborhood, or a name." />
          ) : (
            results.posts.map((p) => <PostCard key={p.id} post={p} compact />)
          )}
        </div>
      </div>
    </div>
  );
}

export function NotifsOverlay() {
  const close = useKindred((s) => s.closeOverlay);
  const notifications = useKindred((s) => s.notifications);
  const markNotifsRead = useKindred((s) => s.markNotifsRead);
  const push = useKindred((s) => s.push);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-bg-elevated">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={close} aria-label="Close notifications">
          <ArrowLeft className="size-5" />
        </Button>
        <span className="flex-1 text-sm font-medium">Notifications</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={markNotifsRead}
        >
          Mark read
        </Button>
      </header>
      <div className="scroll-y flex-1 px-4 pb-10">
        {notifications.length === 0 ? (
          <Empty title="You're caught up" body="Matches, replies, and events will land here." />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className="glass rounded-2xl p-3 text-left"
                onClick={() => {
                  close();
                  if (n.screen) push(n.screen);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read ? <span className="size-2 shrink-0 rounded-full bg-accent" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                <p className="mt-2 text-micro text-subtle">{relativeTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
