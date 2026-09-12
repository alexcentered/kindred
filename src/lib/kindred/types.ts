export type PostType =
  | "request"
  | "offer"
  | "event"
  | "discussion"
  | "resource"
  | "project";

export type AvatarTone = "sage" | "teal" | "sky" | "sand" | "forest" | "stone";

export type TabId = "stream" | "map" | "groups" | "inbox" | "me";

export type Screen =
  | { name: "post"; id: string }
  | { name: "group"; id: string }
  | { name: "person"; id: string }
  | { name: "thread"; id: string };

export type Member = {
  id: string;
  name: string;
  handle: string;
  neighborhood: string;
  bio: string;
  skills: string[];
  interests: string[];
  groupIds: string[];
  tone: AvatarTone;
  initials: string;
};

export type Group = {
  id: string;
  name: string;
  purpose: string;
  neighborhood: string;
  memberIds: string[];
  topics: string[];
  openness: "open" | "protected";
  parentId?: string;
  tone: AvatarTone;
  mapX: number;
  mapY: number;
};

export type Comment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type Post = {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  groupId: string;
  topics: string[];
  location: string;
  createdAt: number;
  helpers: string[];
  rsvps: string[];
  eventAt?: number;
  completed: boolean;
  comments: Comment[];
  mapX: number;
  mapY: number;
  savedBy: string[];
};

export type Thread = {
  id: string;
  participantIds: [string, string];
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type Notif = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  screen?: Screen;
};
