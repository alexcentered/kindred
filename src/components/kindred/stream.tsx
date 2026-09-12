import { useMemo, useState } from "react";
import { ArrowLeft, Bookmark, Calendar, Check, HandHelping, MapPin, Send } from "lucide-react";
import { POST_TYPE_LABEL, POST_TYPES, eventWhen, relativeTime } from "@/lib/kindred/format";
import { INTERESTS, YOU_ID } from "@/lib/kindred/seed";
import { useKindred } from "@/lib/kindred/store";
import { Area, Avatar, Button, Chip, Empty, Field, SectionLabel, TypeBadge } from "./ui";
import { PostCard } from "./post-card";
import { cn } from "@/lib/utils";

export function StreamView() {
  const posts = useKindred((s) => s.posts);
  const members = useKindred((s) => s.members);
  const you = useKindred((s) => s.you());
  const filter = useKindred((s) => s.streamFilter);
  const setFilter = useKindred((s) => s.setStreamFilter);
  const push = useKindred((s) => s.push);

  const nearby = useMemo(
    () =>
      members
        .filter((m) => m.id !== YOU_ID)
        .sort((a, b) => {
          const an = a.neighborhood === you.neighborhood ? 1 : 0;
          const bn = b.neighborhood === you.neighborhood ? 1 : 0;
          return bn - an;
        })
        .slice(0, 8),
    [members, you.neighborhood],
  );

  const visible = posts
    .filter((p) => (filter === "all" ? true : p.type === filter))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="scroll-y h-full px-4 pb-6 pt-2">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {POST_TYPES.map((t) => (
          <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {POST_TYPE_LABEL[t]}
          </Chip>
        ))}
      </div>

      <SectionLabel>People near you</SectionLabel>
      <div className="mt-3 mb-6 flex gap-3 overflow-x-auto pb-1">
        {nearby.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => push({ name: "person", id: m.id })}
            className="flex w-16 shrink-0 flex-col items-center gap-2"
          >
            <Avatar initials={m.initials} tone={m.tone} />
            <span className="w-full truncate text-center text-xs font-medium">{m.name.split(" ")[0]}</span>
            <span className="w-full truncate text-center text-micro text-subtle">{m.neighborhood}</span>
          </button>
        ))}
      </div>

      <SectionLabel>Stream</SectionLabel>
      <div className="stagger-in mt-3 flex flex-col gap-3">
        {visible.length === 0 ? (
          <Empty title="Nothing here yet" body="Try another filter, or post a request of your own." />
        ) : (
          visible.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

export function PostDetail({ id }: { id: string }) {
  const post = useKindred((s) => s.postById(id));
  const author = useKindred((s) => (post ? s.memberById(post.authorId) : undefined));
  const group = useKindred((s) => (post ? s.groupById(post.groupId) : undefined));
  const members = useKindred((s) => s.members);
  const pop = useKindred((s) => s.pop);
  const push = useKindred((s) => s.push);
  const toggleHelp = useKindred((s) => s.toggleHelp);
  const toggleRsvp = useKindred((s) => s.toggleRsvp);
  const toggleSaved = useKindred((s) => s.toggleSaved);
  const markComplete = useKindred((s) => s.markComplete);
  const addComment = useKindred((s) => s.addComment);
  const openThreadWith = useKindred((s) => s.openThreadWith);
  const [note, setNote] = useState("");

  if (!post || !author) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={pop}>
          Back
        </Button>
        <Empty title="Post missing" body="It may have been removed." />
      </div>
    );
  }

  const helping = post.helpers.includes(YOU_ID);
  const going = post.rsvps.includes(YOU_ID);
  const saved = post.savedBy.includes(YOU_ID);
  const isYours = post.authorId === YOU_ID;
  const helperPeople = post.helpers
    .map((hid) => members.find((m) => m.id === hid))
    .filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={pop} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <span className="flex-1 text-sm font-medium">Post</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() => toggleSaved(post.id)}
        >
          <Bookmark className={cn("size-5", saved && "fill-current text-fg")} />
        </Button>
      </header>
      <div className="scroll-y flex-1 px-5 pb-8">
        <TypeBadge type={post.type} />
        <h1 className="mt-2 font-display text-3xl leading-tight text-fg">{post.title}</h1>
        <button
          type="button"
          onClick={() => push({ name: "person", id: author.id })}
          className="mt-4 flex items-center gap-3"
        >
          <Avatar initials={author.initials} tone={author.tone} />
          <div className="text-left">
            <p className="text-sm font-medium">{author.name}</p>
            <p className="text-xs text-subtle">
              {post.location} · {relativeTime(post.createdAt)}
            </p>
          </div>
        </button>
        <p className="mt-5 text-sm leading-relaxed text-fg">{post.body}</p>
        {post.eventAt ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Calendar className="size-4" />
            {eventWhen(post.eventAt)}
          </p>
        ) : null}
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <MapPin className="size-4" />
          {post.location}
        </p>
        {group ? (
          <button
            type="button"
            className="mt-3 text-sm text-muted"
            onClick={() => push({ name: "group", id: group.id })}
          >
            {group.name}
          </button>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.topics.map((t) => (
            <span key={t} className="rounded-full bg-accent-soft px-3 py-1 text-xs text-fg">
              {t}
            </span>
          ))}
        </div>

        {helperPeople.length > 0 ? (
          <div className="mt-5">
            <SectionLabel>Helping</SectionLabel>
            <div className="mt-2 flex -space-x-2">
              {helperPeople.map((m) =>
                m ? (
                  <Avatar key={m.id} initials={m.initials} tone={m.tone} size="sm" className="ring-2 ring-bg" />
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          {post.type === "event" ? (
            <Button variant={going ? "quiet" : "primary"} onClick={() => toggleRsvp(post.id)}>
              {going ? "You're going" : "RSVP"}
            </Button>
          ) : null}
          {post.type === "request" || post.type === "offer" || post.type === "project" ? (
            <Button variant={helping ? "quiet" : "primary"} onClick={() => toggleHelp(post.id)}>
              <HandHelping className="size-4" />
              {helping ? "You're in" : post.type === "offer" ? "I can use this" : "I can help"}
            </Button>
          ) : null}
          {!isYours ? (
            <Button variant="glass" onClick={() => openThreadWith(author.id)}>
              Message {author.name.split(" ")[0]}
            </Button>
          ) : (
            <Button variant="glass" onClick={() => markComplete(post.id)}>
              <Check className="size-4" />
              {post.completed ? "Reopen" : "Mark complete"}
            </Button>
          )}
        </div>

        <div className="mt-8">
          <SectionLabel>Replies</SectionLabel>
          <div className="mt-3 flex flex-col gap-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-muted">Be the first to reply.</p>
            ) : (
              post.comments.map((c) => {
                const who = members.find((m) => m.id === c.authorId);
                if (!who) return null;
                return (
                  <div key={c.id} className="flex gap-3">
                    <button type="button" onClick={() => push({ name: "person", id: who.id })}>
                      <Avatar initials={who.initials} tone={who.tone} size="sm" />
                    </button>
                    <div className="glass flex-1 rounded-xl px-3 py-2">
                      <p className="text-xs font-medium">
                        {who.name}{" "}
                        <span className="font-normal text-subtle">{relativeTime(c.createdAt)}</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addComment(post.id, note);
              setNote("");
            }}
          >
            <Field
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a reply"
              className="flex-1"
            />
            <Button type="submit" size="icon" aria-label="Send reply" disabled={!note.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ComposeSheet() {
  const draft = useKindred((s) => s.draft);
  const setDraft = useKindred((s) => s.setDraft);
  const createPost = useKindred((s) => s.createPost);
  const close = useKindred((s) => s.closeOverlay);
  const groups = useKindred((s) => s.groups);
  const you = useKindred((s) => s.you());

  const joined = groups.filter((g) => you.groupIds.includes(g.id) || g.id === "la-commons");

  const toggleTopic = (t: string) => {
    setDraft({
      topics: draft.topics.includes(t) ? draft.topics.filter((x) => x !== t) : [...draft.topics, t],
    });
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg/40">
      <button type="button" className="h-16 shrink-0" aria-label="Close composer" onClick={close} />
      <div className="glass-strong flex min-h-0 flex-1 flex-col rounded-t-3xl px-5 pt-4 safe-pad-bottom">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Share with Kindred</h2>
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {POST_TYPES.map((t) => (
            <Chip key={t} active={draft.type === t} onClick={() => setDraft({ type: t })}>
              {POST_TYPE_LABEL[t]}
            </Chip>
          ))}
        </div>
        <div className="scroll-y mt-4 flex min-h-0 flex-1 flex-col gap-3">
          <Field
            value={draft.title}
            onChange={(e) => setDraft({ title: e.target.value })}
            placeholder="Title"
          />
          <Area
            value={draft.body}
            onChange={(e) => setDraft({ body: e.target.value })}
            placeholder="What do you need, or what can you offer?"
          />
          <Field
            value={draft.location}
            onChange={(e) => setDraft({ location: e.target.value })}
            placeholder="Neighborhood"
          />
          <label className="text-xs font-medium uppercase tracking-wider text-subtle">Group</label>
          <div className="flex flex-wrap gap-2">
            {joined.map((g) => (
              <Chip key={g.id} active={draft.groupId === g.id} onClick={() => setDraft({ groupId: g.id })}>
                {g.name}
              </Chip>
            ))}
          </div>
          <label className="text-xs font-medium uppercase tracking-wider text-subtle">Topics</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((t) => (
              <Chip key={t} active={draft.topics.includes(t)} onClick={() => toggleTopic(t)}>
                {t.replace("-", " ")}
              </Chip>
            ))}
          </div>
        </div>
        <Button
          className="mt-4"
          size="lg"
          disabled={!draft.title.trim() || !draft.body.trim()}
          onClick={() => createPost()}
        >
          Publish
        </Button>
      </div>
    </div>
  );
}

