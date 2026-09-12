import { createFileRoute } from "@tanstack/react-router";
import { KindredApp } from "@/components/kindred/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <KindredApp />;
}
