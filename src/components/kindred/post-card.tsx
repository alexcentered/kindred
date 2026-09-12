import { Bookmark, MapPin } from "lucide-react";
import { Avatar, TypeBadge } from "./ui";
import { postMatchesYou, relativeTime } from "@/lib/kindred/format";
import { useKindred } from "@/lib/kindred/store";
import type { Post } from "@/lib/kindred/types";
import { YOU_ID } from "@/lib/kindred/seed";
import { cn } from "@/lib/utils";

export function PostCard({ post, compact }: { post: Post; compact?: boolean }) {
  const author = useKindred((s) => s.memberById(post.authorId));
  const group = useKindred((s) => s.groupById(post.groupId));
  const you = useKindred((s) => s.you());
  const push = useKindred((s) => s.push);
  const toggleSaved = useKindred((s) => s.toggleSaved);
  const matches = postMatchesYou(post, you);
  const saved = post.savedBy.includes(YOU_ID);

  if (!author) return null;

  return (
    <article className="glass rounded-2xl p-4 text-left transition-[box-shadow,transform] duration-200 ease-out">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => push({ name: "post", id: post.id })}
      >
        <div className="flex items-start gap-3">
          <Avatar initials={author.initials} tone={author.tone} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <TypeBadge type={post.type} />
              {post.completed ? <span className="text-xs text-subtle">Closed</span> : null}
            </div>
            <h3 className="mt-1 font-medium leading-snug text-fg">{post.title}</h3>
            {!compact ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{post.body}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
              <span>{author.name}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {post.location}
              </span>
              <span>{relativeTime(post.createdAt)}</span>
            </div>
            {group ? <p className="mt-1 text-xs text-subtle">{group.name}</p> : null}
            {matches.length > 0 ? (
              <p className="mt-2 text-xs font-medium text-signal">
                Matches your {matches.slice(0, 2).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </button>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-subtle">
          {post.type === "event"
            ? `${post.rsvps.length} going`
            : post.type === "request" || post.type === "offer"
              ? `${post.helpers.length} helping`
              : `${post.comments.length} replies`}
        </p>
        <button
          type="button"
          aria-label={saved ? "Unsave" : "Save"}
          onClick={(e) => {
            e.stopPropagation();
            toggleSaved(post.id);
          }}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl text-muted transition-colors duration-150",
            saved && "text-fg",
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
