import { useState } from "react";
import { useKindred } from "@/lib/kindred/store";
import { POST_TYPE_LABEL } from "@/lib/kindred/format";
import { Chip, SectionLabel } from "./ui";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/kindred/types";

type Pin =
  | { kind: "post"; id: string; x: number; y: number; label: string; type: Post["type"] }
  | { kind: "person"; id: string; x: number; y: number; label: string }
  | { kind: "group"; id: string; x: number; y: number; label: string };

const PLACES = [
  { name: "Pacific", x: 8, y: 78 },
  { name: "Venice", x: 16, y: 68 },
  { name: "Culver", x: 28, y: 62 },
  { name: "Echo Park", x: 40, y: 42 },
  { name: "Los Feliz", x: 52, y: 32 },
  { name: "Pasadena", x: 72, y: 20 },
  { name: "Downtown", x: 56, y: 56 },
  { name: "Boyle Hts", x: 66, y: 64 },
  { name: "Leimert", x: 42, y: 76 },
];

export function MapView() {
  const posts = useKindred((s) => s.posts);
  const members = useKindred((s) => s.members);
  const groups = useKindred((s) => s.groups);
  const layers = useKindred((s) => s.mapLayers);
  const toggleLayer = useKindred((s) => s.toggleLayer);
  const push = useKindred((s) => s.push);
  const [active, setActive] = useState<Pin | null>(null);

  const pins: Pin[] = [];
  if (layers.posts) {
    for (const p of posts) {
      pins.push({ kind: "post", id: p.id, x: p.mapX, y: p.mapY, label: p.title, type: p.type });
    }
  }
  if (layers.people) {
    for (const m of members) {
      const jitter = m.id.charCodeAt(0) % 7;
      pins.push({
        kind: "person",
        id: m.id,
        x: 42 + jitter * 3,
        y: 30 + (m.name.length % 12) * 3,
        label: m.name,
      });
    }
  }
  if (layers.groups) {
    for (const g of groups) {
      if (g.id === "la-commons") continue;
      pins.push({ kind: "group", id: g.id, x: g.mapX, y: g.mapY, label: g.name });
    }
  }

  const go = () => {
    if (!active) return;
    if (active.kind === "post") push({ name: "post", id: active.id });
    if (active.kind === "person") push({ name: "person", id: active.id });
    if (active.kind === "group") push({ name: "group", id: active.id });
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-2">
      <SectionLabel>Los Angeles</SectionLabel>
      <p className="mt-1 text-sm text-muted">Requests, people, and groups around you.</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <Chip active={layers.posts} onClick={() => toggleLayer("posts")}>
          Posts
        </Chip>
        <Chip active={layers.people} onClick={() => toggleLayer("people")}>
          People
        </Chip>
        <Chip active={layers.groups} onClick={() => toggleLayer("groups")}>
          Groups
        </Chip>
      </div>
      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-3xl glass">
        <Basin />
        {PLACES.map((place) => (
          <span
            key={place.name}
            className="pointer-events-none absolute -translate-x-1/2 text-micro font-medium text-muted"
            style={{ left: `${place.x}%`, top: `${place.y}%` }}
          >
            {place.name}
          </span>
        ))}
        {pins.map((pin) => (
          <button
            key={`${pin.kind}-${pin.id}`}
            type="button"
            onClick={() => setActive(pin)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-label={pin.label}
          >
            <span
              className={cn(
                "size-3.5 rounded-full ring-2 ring-bg-elevated transition-transform duration-150",
                pin.kind === "post" && `dot-${(pin as Extract<Pin, { kind: "post" }>).type}`,
                pin.kind === "person" && "bg-fg",
                pin.kind === "group" && "bg-accent",
                active?.id === pin.id && active.kind === pin.kind && "scale-150",
              )}
            />
          </button>
        ))}
        {active ? (
          <button
            type="button"
            onClick={go}
            className="glass-strong absolute inset-x-3 bottom-3 rounded-2xl p-3 text-left"
          >
            <p className="text-xs uppercase tracking-wider text-subtle">
              {active.kind === "post"
                ? POST_TYPE_LABEL[(active as Extract<Pin, { kind: "post" }>).type]
                : active.kind}
            </p>
            <p className="mt-1 text-sm font-medium leading-snug">{active.label}</p>
            <p className="mt-1 text-xs text-muted">Open</p>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Basin() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
      <rect width="100" height="100" className="map-land" />
      <path
        d="M0 18 C 8 22, 12 40, 10 70 C 8 88, 0 92, 0 100 L 0 18 Z"
        className="map-sea"
      />
      <path
        d="M8 0 C 22 8, 40 6, 58 14 C 70 8, 88 12, 100 6 L 100 0 Z"
        className="map-hills"
      />
      <path
        d="M22 30 C 34 28, 46 34, 52 48 C 58 62, 48 72, 36 70 C 24 68, 16 50, 22 30 Z"
        className="map-hills"
      />
    </svg>
  );
}
