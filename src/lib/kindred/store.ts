import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  groups as seedGroups,
  members as seedMembers,
  messages as seedMessages,
  notifications as seedNotifs,
  posts as seedPosts,
  threads as seedThreads,
  YOU_ID,
} from "./seed";
import { initialsFrom, otherParticipant } from "./format";
import type {
  ChatMessage,
  Group,
  Member,
  Notif,
  Post,
  PostType,
  Screen,
  TabId,
  Thread,
} from "./types";

export type ThemeMode = "dark" | "light";
export type PaletteId = "forest" | "ink";
export type Overlay = "none" | "search" | "notifs" | "compose";

type ComposeDraft = {
  type: PostType;
  title: string;
  body: string;
  groupId: string;
  location: string;
  topics: string[];
};

type KindredState = {
  hydrated: boolean;
  onboarded: boolean;
  theme: ThemeMode;
  palette: PaletteId;
  tab: TabId;
  stack: Screen[];
  overlay: Overlay;
  streamFilter: PostType | "all";
  mapLayers: { posts: boolean; people: boolean; groups: boolean };
  members: Member[];
  groups: Group[];
  posts: Post[];
  threads: Thread[];
  messages: ChatMessage[];
  notifications: Notif[];
  draft: ComposeDraft;
  completeOnboarding: (payload: {
    name: string;
    neighborhood: string;
    interests: string[];
    skills: string[];
  }) => void;
  skipOnboarding: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: PaletteId) => void;
  setTab: (tab: TabId) => void;
  push: (screen: Screen) => void;
  pop: () => void;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
  setStreamFilter: (filter: PostType | "all") => void;
  toggleLayer: (layer: keyof KindredState["mapLayers"]) => void;
  you: () => Member;
  createPost: () => string | null;
  setDraft: (patch: Partial<ComposeDraft>) => void;
  resetDraft: () => void;
  addComment: (postId: string, body: string) => void;
  toggleHelp: (postId: string) => void;
  toggleRsvp: (postId: string) => void;
  toggleSaved: (postId: string) => void;
  markComplete: (postId: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendMessage: (threadId: string, body: string) => void;
  openThreadWith: (memberId: string) => void;
  updateProfile: (patch: Partial<Pick<Member, "name" | "bio" | "neighborhood" | "skills" | "interests">>) => void;
  markNotifsRead: () => void;
  memberById: (id: string) => Member | undefined;
  groupById: (id: string) => Group | undefined;
  postById: (id: string) => Post | undefined;
};

const defaultDraft = (): ComposeDraft => ({
  type: "request",
  title: "",
  body: "",
  groupId: "echo-park-aid",
  location: "Echo Park",
  topics: [],
});

const THEME_COLORS: Record<PaletteId, Record<ThemeMode, string>> = {
  forest: { dark: "#0c120e", light: "#e8eee4" },
  ink: { dark: "#050505", light: "#ececec" },
};

export function applyAppearance(theme: ThemeMode, palette: PaletteId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light", "palette-forest", "palette-ink");
  root.classList.add(theme === "light" ? "light" : "dark");
  root.classList.add(palette === "ink" ? "palette-ink" : "palette-forest");
  root.setAttribute("data-palette", palette);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[palette][theme]);
}

export const useKindred = create<KindredState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      theme: "dark",
      palette: "forest",
      tab: "stream",
      stack: [],
      overlay: "none",
      streamFilter: "all",
      mapLayers: { posts: true, people: true, groups: true },
      members: seedMembers,
      groups: seedGroups,
      posts: seedPosts,
      threads: seedThreads,
      messages: seedMessages,
      notifications: seedNotifs,
      draft: defaultDraft(),

      you: () => get().members.find((m) => m.id === YOU_ID) ?? seedMembers[0]!,
      memberById: (id) => get().members.find((m) => m.id === id),
      groupById: (id) => get().groups.find((g) => g.id === id),
      postById: (id) => get().posts.find((p) => p.id === id),

      completeOnboarding: ({ name, neighborhood, interests, skills }) =>
        set((s) => ({
          onboarded: true,
          members: s.members.map((m) =>
            m.id === YOU_ID
              ? {
                  ...m,
                  name: name.trim() || m.name,
                  initials: initialsFrom(name.trim() || m.name),
                  neighborhood: neighborhood.trim() || m.neighborhood,
                  interests,
                  skills,
                }
              : m,
          ),
        })),
      skipOnboarding: () => set({ onboarded: true }),
      setTheme: (theme) => {
        applyAppearance(theme, get().palette);
        set({ theme });
      },
      setPalette: (palette) => {
        applyAppearance(get().theme, palette);
        set({ palette });
      },
      setTab: (tab) => set({ tab, stack: [], overlay: "none" }),
      push: (screen) =>
        set((s) => ({
          stack: [...s.stack, screen],
          overlay: "none",
        })),
      pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
      openOverlay: (overlay) => set({ overlay }),
      closeOverlay: () => set({ overlay: "none" }),
      setStreamFilter: (streamFilter) => set({ streamFilter }),
      toggleLayer: (layer) =>
        set((s) => ({ mapLayers: { ...s.mapLayers, [layer]: !s.mapLayers[layer] } })),
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      resetDraft: () => set({ draft: defaultDraft() }),
      createPost: () => {
        const { draft, you } = get();
        const title = draft.title.trim();
        const body = draft.body.trim();
        if (!title || !body) return null;
        const me = you();
        const id = `p-${crypto.randomUUID().slice(0, 8)}`;
        const post: Post = {
          id,
          type: draft.type,
          title,
          body,
          authorId: YOU_ID,
          groupId: draft.groupId,
          topics: draft.topics,
          location: draft.location.trim() || me.neighborhood,
          createdAt: Date.now(),
          helpers: [],
          rsvps: draft.type === "event" ? [YOU_ID] : [],
          eventAt:
            draft.type === "event" ? Date.now() + 3 * 24 * 60 * 60 * 1000 : undefined,
          completed: false,
          comments: [],
          mapX: 46 + Math.random() * 12,
          mapY: 38 + Math.random() * 16,
          savedBy: [],
        };
        set((s) => ({
          posts: [post, ...s.posts],
          overlay: "none",
          draft: defaultDraft(),
          tab: "stream",
          stack: [{ name: "post", id }],
        }));
        return id;
      },
      addComment: (postId, body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: `c-${crypto.randomUUID().slice(0, 8)}`,
                      authorId: YOU_ID,
                      body: text,
                      createdAt: Date.now(),
                    },
                  ],
                }
              : p,
          ),
        }));
      },
      toggleHelp: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const has = p.helpers.includes(YOU_ID);
            return {
              ...p,
              helpers: has ? p.helpers.filter((id) => id !== YOU_ID) : [...p.helpers, YOU_ID],
            };
          }),
        })),
      toggleRsvp: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const has = p.rsvps.includes(YOU_ID);
            return {
              ...p,
              rsvps: has ? p.rsvps.filter((id) => id !== YOU_ID) : [...p.rsvps, YOU_ID],
            };
          }),
        })),
      toggleSaved: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const has = p.savedBy.includes(YOU_ID);
            return {
              ...p,
              savedBy: has ? p.savedBy.filter((id) => id !== YOU_ID) : [...p.savedBy, YOU_ID],
            };
          }),
        })),
      markComplete: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === postId ? { ...p, completed: !p.completed } : p)),
        })),
      joinGroup: (groupId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId && !g.memberIds.includes(YOU_ID)
              ? { ...g, memberIds: [...g.memberIds, YOU_ID] }
              : g,
          ),
          members: s.members.map((m) =>
            m.id === YOU_ID && !m.groupIds.includes(groupId)
              ? { ...m, groupIds: [...m.groupIds, groupId] }
              : m,
          ),
        })),
      leaveGroup: (groupId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, memberIds: g.memberIds.filter((id) => id !== YOU_ID) }
              : g,
          ),
          members: s.members.map((m) =>
            m.id === YOU_ID
              ? { ...m, groupIds: m.groupIds.filter((id) => id !== groupId) }
              : m,
          ),
        })),
      sendMessage: (threadId, body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: `m-${crypto.randomUUID().slice(0, 8)}`,
              threadId,
              authorId: YOU_ID,
              body: text,
              createdAt: Date.now(),
            },
          ],
        }));
      },
      openThreadWith: (memberId) => {
        if (memberId === YOU_ID) return;
        const existing = get().threads.find(
          (t) =>
            t.participantIds.includes(YOU_ID) && t.participantIds.includes(memberId),
        );
        if (existing) {
          set({
            tab: "inbox",
            overlay: "none",
            stack: [{ name: "thread", id: existing.id }],
          });
          return;
        }
        const id = `t-${crypto.randomUUID().slice(0, 8)}`;
        const thread: Thread = { id, participantIds: [YOU_ID, memberId] };
        set((s) => ({
          threads: [thread, ...s.threads],
          tab: "inbox",
          overlay: "none",
          stack: [{ name: "thread", id }],
        }));
      },
      updateProfile: (patch) =>
        set((s) => ({
          members: s.members.map((m) =>
            m.id === YOU_ID
              ? {
                  ...m,
                  ...patch,
                  initials: patch.name ? initialsFrom(patch.name) : m.initials,
                }
              : m,
          ),
        })),
      markNotifsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: "kindred-v1",
      skipHydration: true,
      partialize: (s) => ({
        onboarded: s.onboarded,
        theme: s.theme,
        palette: s.palette,
        members: s.members,
        groups: s.groups,
        posts: s.posts,
        threads: s.threads,
        messages: s.messages,
        notifications: s.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const palette: PaletteId = state.palette === "ink" ? "ink" : "forest";
          applyAppearance(state.theme, palette);
          useKindred.setState({ hydrated: true, palette });
        } else {
          applyAppearance("dark", "forest");
          useKindred.setState({ hydrated: true });
        }
      },
    },
  ),
);

export function lastMessage(threadId: string, messages: ChatMessage[]) {
  const list = messages.filter((m) => m.threadId === threadId);
  return list[list.length - 1];
}

export function threadPreview(
  thread: Thread,
  messages: ChatMessage[],
  members: Member[],
  youId: string,
) {
  const otherId = otherParticipant(thread.participantIds, youId);
  const other = members.find((m) => m.id === otherId);
  const last = lastMessage(thread.id, messages);
  return { other, last };
}
