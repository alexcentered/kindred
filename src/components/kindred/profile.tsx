import { useState } from "react";
import { INTERESTS, SKILL_POOL, YOU_ID } from "@/lib/kindred/seed";
import { useKindred } from "@/lib/kindred/store";
import { Avatar, Button, Chip, Field, SectionLabel } from "./ui";
import { PostCard } from "./post-card";
import { AppearanceSettings } from "./look";

export function MeView() {
  const you = useKindred((s) => s.you());
  const posts = useKindred((s) => s.posts);
  const updateProfile = useKindred((s) => s.updateProfile);
  const push = useKindred((s) => s.push);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(you.name);
  const [bio, setBio] = useState(you.bio);
  const [neighborhood, setNeighborhood] = useState(you.neighborhood);
  const [skills, setSkills] = useState(you.skills);
  const [interests, setInterests] = useState(you.interests);

  const mine = posts.filter((p) => p.authorId === YOU_ID);
  const saved = posts.filter((p) => p.savedBy.includes(YOU_ID));

  const toggle = (list: string[], value: string, set: (v: string[]) => void) => {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const save = () => {
    updateProfile({ name, bio, neighborhood, skills, interests });
    setEditing(false);
  };

  return (
    <div className="scroll-y h-full px-5 pb-8 pt-2">
      <div className="flex items-center gap-4">
        <Avatar initials={you.initials} tone={you.tone} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl leading-tight">{you.name}</h1>
          <p className="text-sm text-muted">
            @{you.handle} · {you.neighborhood}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{you.bio}</p>

      <div className="mt-5 flex gap-2">
        <Button variant="glass" size="sm" onClick={() => setEditing((v) => !v)}>
          {editing ? "Cancel" : "Edit profile"}
        </Button>
      </div>

      <div className="mt-8">
        <SectionLabel>Settings</SectionLabel>
        <div className="mt-3">
          <AppearanceSettings />
        </div>
      </div>

      {editing ? (
        <div className="mt-5 flex flex-col gap-3">
          <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Field
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Neighborhood"
          />
          <Field value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          <SectionLabel>Skills</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {SKILL_POOL.map((s) => (
              <Chip key={s} active={skills.includes(s)} onClick={() => toggle(skills, s, setSkills)}>
                {s}
              </Chip>
            ))}
          </div>
          <SectionLabel>Interests</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((s) => (
              <Chip key={s} active={interests.includes(s)} onClick={() => toggle(interests, s, setInterests)}>
                {s.replace("-", " ")}
              </Chip>
            ))}
          </div>
          <Button onClick={save}>Save</Button>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SectionLabel>Skills</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {you.skills.map((s) => (
                <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <SectionLabel>Interests</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {you.interests.map((s) => (
                <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-xs">
                  {s.replace("-", " ")}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <SectionLabel>Your posts</SectionLabel>
        <div className="mt-3 flex flex-col gap-3">
          {mine.map((p) => (
            <PostCard key={p.id} post={p} compact />
          ))}
        </div>
      </div>
      <div className="mt-8">
        <SectionLabel>Saved</SectionLabel>
        <div className="mt-3 flex flex-col gap-3">
          {saved.length === 0 ? (
            <p className="text-sm text-muted">Save posts from the stream to find them later.</p>
          ) : (
            saved.map((p) => <PostCard key={p.id} post={p} compact />)
          )}
        </div>
      </div>
      <button
        type="button"
        className="mt-6 text-sm text-subtle"
        onClick={() => push({ name: "person", id: YOU_ID })}
      >
        View public profile
      </button>
    </div>
  );
}
