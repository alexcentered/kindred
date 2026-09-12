import { formatDistanceToNowStrict, format } from "date-fns";
import type { Member, Post, PostType } from "./types";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  request: "Request",
  offer: "Offer",
  event: "Event",
  discussion: "Discussion",
  resource: "Resource",
  project: "Project",
};

export const POST_TYPES = Object.keys(POST_TYPE_LABEL) as PostType[];

export function relativeTime(ts: number) {
  return formatDistanceToNowStrict(ts, { addSuffix: true });
}

export function eventWhen(ts: number) {
  return format(ts, "EEE, MMM d · h:mm a");
}

export function overlap(a: string[], b: string[]) {
  const set = new Set(a.map((s) => s.toLowerCase()));
  return b.filter((s) => set.has(s.toLowerCase()));
}

export function matchScore(you: Member, other: Member) {
  const skills = overlap(you.skills, other.skills);
  const interests = overlap(you.interests, other.interests);
  return skills.length * 2 + interests.length;
}

export function postMatchesYou(post: Post, you: Member) {
  const hay = [...post.topics, ...post.title.toLowerCase().split(/\s+/)];
  return overlap(
    [...you.skills, ...you.interests].map((s) => s.toLowerCase()),
    hay,
  );
}

export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Y";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function otherParticipant(ids: [string, string], youId: string) {
  return ids[0] === youId ? ids[1] : ids[0];
}
