import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Kindred";
const THEME_BOOT = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("kindred-v1");var theme="dark";var palette="forest";if(t){var p=JSON.parse(t);if(p&&p.state){if(p.state.theme==="light")theme="light";if(p.state.palette==="ink")palette="ink";}}r.classList.remove("dark","light","palette-forest","palette-ink");r.classList.add(theme==="light"?"light":"dark");r.classList.add(palette==="ink"?"palette-ink":"palette-forest");r.setAttribute("data-palette",palette);r.style.colorScheme=theme;var c=palette==="forest"?(theme==="light"?"#e8eee4":"#0c120e"):(theme==="light"?"#ececec":"#050505");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",c);}catch(e){document.documentElement.classList.add("dark","palette-forest");}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0c120e" },
      { name: "description", content: "Find your people. Share skills, surplus, and care." },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
