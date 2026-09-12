import { ArrowLeft, MapPin, MessageCircle, Shield } from "lucide-react";
import { matchScore, overlap } from "@/lib/kindred/format";
import { YOU_ID } from "@/lib/kindred/seed";
import { useKindred } from "@/lib/kindred/store";
import { Avatar, Button, Empty, SectionLabel } from "./ui";
import { PostCard } from "./post-card";

export function GroupsView() {
  const groups = useKindred((s) => s.groups);
  const you = useKindred((s) => s.you());
  const push = useKindred((s) => s.push);
  const network = groups.find((g) => g.id === "la-commons");
  const children = groups.filter((g) => g.parentId === "la-commons");
  const joined = groups.filter((g) => you.groupIds.includes(g.id) && g.id !== "la-commons");

  return (
    <div className="scroll-y h-full px-4 pb-6 pt-2">
      {network ? (
        <button
          type="button"
          onClick={() => push({ name: "group", id: network.id })}
          className="glass w-full rounded-2xl p-4 text-left"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Network</p>
          <h2 className="mt-1 font-display text-2xl">{network.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{network.purpose}</p>
          <p className="mt-3 text-xs text-subtle">{network.memberIds.length} members · {children.length} groups</p>
        </button>
      ) : null}

      <div className="mt-6">
        <SectionLabel>Your groups</SectionLabel>
        <div className="mt-3 flex flex-col gap-2">
          {joined.map((g) => (
            <GroupRow key={g.id} id={g.id} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel>Explore</SectionLabel>
        <div className="mt-3 flex flex-col gap-2">
          {children.map((g) => (
            <GroupRow key={g.id} id={g.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupRow({ id }: { id: string }) {
  const group = useKindred((s) => s.groupById(id));
  const push = useKindred((s) => s.push);
  const you = useKindred((s) => s.you());
  if (!group) return null;
  const inGroup = you.groupIds.includes(group.id);
  return (
    <button
      type="button"
      onClick={() => push({ name: "group", id: group.id })}
      className="glass flex items-center gap-3 rounded-2xl p-3 text-left"
    >
      <div className={`flex size-11 items-center justify-center rounded-xl text-sm font-medium tone-${group.tone}`}>
        {group.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{group.name}</p>
        <p className="truncate text-xs text-subtle">
          {group.neighborhood} · {group.memberIds.length} members
          {inGroup ? " · joined" : ""}
        </p>
      </div>
    </button>
  );
}

export function GroupDetail({ id }: { id: string }) {
  const group = useKindred((s) => s.groupById(id));
  const members = useKindred((s) => s.members);
  const posts = useKindred((s) => s.posts);
  const you = useKindred((s) => s.you());
  const pop = useKindred((s) => s.pop);
  const push = useKindred((s) => s.push);
  const joinGroup = useKindred((s) => s.joinGroup);
  const leaveGroup = useKindred((s) => s.leaveGroup);
  const parent = useKindred((s) => (group?.parentId ? s.groupById(group.parentId) : undefined));
  const children = useKindred((s) => s.groups.filter((g) => g.parentId === id));

  if (!group) {
    return (
      <div className="p-6">
        <Empty title="Group missing" body="It may have been removed." />
      </div>
    );
  }

  const inGroup = you.groupIds.includes(group.id);
  const people = members.filter((m) => group.memberIds.includes(m.id));
  const feed = posts.filter((p) => p.groupId === group.id);

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={pop} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <span className="flex-1 truncate text-sm font-medium">{group.name}</span>
      </header>
      <div className="scroll-y flex-1 px-5 pb-10">
        <div className={`mb-4 flex h-28 items-end rounded-3xl p-4 tone-${group.tone}`}>
          <p className="font-display text-2xl leading-tight">{group.name}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted">{group.purpose}</p>
        <p className="mt-3 flex items-center gap-2 text-xs text-subtle">
          <MapPin className="size-3.5" />
          {group.neighborhood}
          {group.openness === "protected" ? (
            <span className="inline-flex items-center gap-1">
              <Shield className="size-3.5" /> Protected
            </span>
          ) : (
            <span>Open</span>
          )}
        </p>
        {parent ? (
          <button
            type="button"
            className="mt-2 text-xs text-muted"
            onClick={() => push({ name: "group", id: parent.id })}
          >
            Part of {parent.name}
          </button>
        ) : null}
        <div className="mt-4">
          {inGroup ? (
            <Button variant="glass" onClick={() => leaveGroup(group.id)}>
              Leave group
            </Button>
          ) : (
            <Button onClick={() => joinGroup(group.id)}>Join group</Button>
          )}
        </div>

        {children.length > 0 ? (
          <div className="mt-6">
            <SectionLabel>Nested groups</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {children.map((g) => (
                <GroupRow key={g.id} id={g.id} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <SectionLabel>Members</SectionLabel>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {people.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => push({ name: "person", id: m.id })}
                className="flex w-20 shrink-0 flex-col items-center gap-2"
              >
                <Avatar initials={m.initials} tone={m.tone} />
                <span className="w-full truncate text-center text-xs">{m.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <SectionLabel>Stream</SectionLabel>
          <div className="mt-3 flex flex-col gap-3">
            {feed.length === 0 ? (
              <Empty title="Quiet for now" body="Be the first to post in this group." />
            ) : (
              feed.map((p) => <PostCard key={p.id} post={p} compact />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PersonDetail({ id }: { id: string }) {
  const person = useKindred((s) => s.memberById(id));
  const you = useKindred((s) => s.you());
  const groups = useKindred((s) => s.groups);
  const posts = useKindred((s) => s.posts);
  const pop = useKindred((s) => s.pop);
  const push = useKindred((s) => s.push);
  const openThreadWith = useKindred((s) => s.openThreadWith);

  if (!person) {
    return (
      <div className="p-6">
        <Empty title="Member missing" body="They may have left Kindred." />
      </div>
    );
  }

  const sharedSkills = overlap(you.skills, person.skills);
  const sharedInterests = overlap(you.interests, person.interests);
  const score = matchScore(you, person);
  const theirGroups = groups.filter((g) => person.groupIds.includes(g.id) && g.id !== "la-commons");
  const theirPosts = posts.filter((p) => p.authorId === person.id);
  const isYou = person.id === YOU_ID;

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex items-center gap-1 px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={pop} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <span className="flex-1 text-sm font-medium">Profile</span>
      </header>
      <div className="scroll-y flex-1 px-5 pb-10">
        <div className="flex items-center gap-4">
          <Avatar initials={person.initials} tone={person.tone} size="xl" />
          <div>
            <h1 className="font-display text-3xl leading-tight">{person.name}</h1>
            <p className="text-sm text-muted">
              @{person.handle} · {person.neighborhood}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{person.bio}</p>
        {!isYou && score > 0 ? (
          <p className="mt-3 text-sm font-medium text-signal">
            {sharedSkills.length} shared skills
            {sharedInterests.length ? ` · ${sharedInterests.length} shared interests` : ""}
          </p>
        ) : null}
        {!isYou ? (
          <Button className="mt-5" onClick={() => openThreadWith(person.id)}>
            <MessageCircle className="size-4" />
            Message
          </Button>
        ) : null}

        <div className="mt-6">
          <SectionLabel>Skills</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {person.skills.map((s) => (
              <span
                key={s}
                className={
                  sharedSkills.includes(s)
                    ? "rounded-full bg-accent px-3 py-1 text-xs text-accent-fg"
                    : "rounded-full bg-accent-soft px-3 py-1 text-xs"
                }
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <SectionLabel>Interests</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {person.interests.map((s) => (
              <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-xs">
                {s.replace("-", " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SectionLabel>Groups</SectionLabel>
          <div className="mt-3 flex flex-col gap-2">
            {theirGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => push({ name: "group", id: g.id })}
                className="glass rounded-xl px-3 py-2 text-left text-sm"
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SectionLabel>Posts</SectionLabel>
          <div className="mt-3 flex flex-col gap-3">
            {theirPosts.map((p) => (
              <PostCard key={p.id} post={p} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
