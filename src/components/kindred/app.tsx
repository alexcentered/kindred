import { useEffect } from "react";
import {
  Bell,
  Compass,
  Home,
  Map as MapIcon,
  MessageCircle,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import { useKindred, applyAppearance } from "@/lib/kindred/store";
import type { TabId } from "@/lib/kindred/types";
import { Onboarding } from "./onboarding";
import { StreamView, PostDetail, ComposeSheet } from "./stream";
import { MapView } from "./map-view";
import { GroupsView, GroupDetail, PersonDetail } from "./community";
import { InboxView, ThreadView } from "./inbox";
import { MeView } from "./profile";
import { NotifsOverlay, SearchOverlay } from "./overlays";
import { cn } from "@/lib/utils";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "stream", label: "Stream", icon: Home },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "groups", label: "Groups", icon: Users },
  { id: "inbox", label: "Inbox", icon: MessageCircle },
  { id: "me", label: "You", icon: User },
];

export function KindredApp() {
  const hydrated = useKindred((s) => s.hydrated);
  const onboarded = useKindred((s) => s.onboarded);
  const theme = useKindred((s) => s.theme);
  const palette = useKindred((s) => s.palette);

  useEffect(() => {
    void useKindred.persist.rehydrate();
    const t = window.setTimeout(() => {
      if (!useKindred.getState().hydrated) {
        useKindred.setState({ hydrated: true });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyAppearance(theme, palette);
  }, [hydrated, theme, palette]);

  return (
    <div className="stage flex items-stretch justify-center">
      <div className="stage-noise" />
      <div className="phone">
        {!onboarded ? <Onboarding /> : <Shell />}
      </div>
    </div>
  );
}

function Shell() {
  const tab = useKindred((s) => s.tab);
  const stack = useKindred((s) => s.stack);
  const overlay = useKindred((s) => s.overlay);
  const unread = useKindred((s) => s.notifications.some((n) => !n.read));
  const setTab = useKindred((s) => s.setTab);
  const openOverlay = useKindred((s) => s.openOverlay);
  const top = stack[stack.length - 1];
  const titles: Record<TabId, string> = {
    stream: "Stream",
    map: "Map",
    groups: "Groups",
    inbox: "Inbox",
    me: "You",
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {!top ? (
        <header className="app-header flex shrink-0 items-center gap-2 px-4 pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Compass className="size-5 text-fg" />
            <div className="min-w-0">
              <p className="font-display text-xl leading-none tracking-tight">Kindred</p>
              <p className="text-micro text-subtle">{titles[tab]}</p>
            </div>
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl glass"
            aria-label="Search"
            onClick={() => openOverlay("search")}
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-xl glass"
            aria-label="Notifications"
            onClick={() => openOverlay("notifs")}
          >
            <Bell className="size-4" />
            {unread ? <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-signal" /> : null}
          </button>
        </header>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {!top && tab === "stream" ? <StreamView /> : null}
        {!top && tab === "map" ? <MapView /> : null}
        {!top && tab === "groups" ? <GroupsView /> : null}
        {!top && tab === "inbox" ? <InboxView /> : null}
        {!top && tab === "me" ? <MeView /> : null}
        {top?.name === "post" ? <PostDetail id={top.id} /> : null}
        {top?.name === "group" ? <GroupDetail id={top.id} /> : null}
        {top?.name === "person" ? <PersonDetail id={top.id} /> : null}
        {top?.name === "thread" ? <ThreadView id={top.id} /> : null}

        {tab === "stream" && !top ? (
          <button
            type="button"
            onClick={() => openOverlay("compose")}
            className="fab"
            aria-label="New post"
          >
            <Plus className="size-5" />
          </button>
        ) : null}
      </div>

      {!top ? (
        <nav className="tabbar" aria-label="Primary">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-micro font-medium transition-colors duration-150",
                  active ? "text-fg" : "text-subtle",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="tab-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      {overlay === "search" ? <SearchOverlay /> : null}
      {overlay === "notifs" ? <NotifsOverlay /> : null}
      {overlay === "compose" ? <ComposeSheet /> : null}
    </div>
  );
}
