import { useKindred } from "@/lib/kindred/store";
import { cn } from "@/lib/utils";

function SettingSwitch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex h-14 w-full items-center justify-between gap-4 px-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block text-micro text-muted">{hint}</span>
      </span>
      <span className={cn("switch", checked && "switch-on")} aria-hidden>
        <span className="switch-knob" />
      </span>
    </button>
  );
}

export function AppearanceSettings() {
  const palette = useKindred((s) => s.palette);
  const setPalette = useKindred((s) => s.setPalette);
  const theme = useKindred((s) => s.theme);
  const setTheme = useKindred((s) => s.setTheme);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <SettingSwitch
        label="Light"
        hint="Bright surfaces"
        checked={theme === "light"}
        onChange={(on) => setTheme(on ? "light" : "dark")}
      />
      <div className="mx-4 h-px bg-border" />
      <SettingSwitch
        label="Ink"
        hint="Black and white"
        checked={palette === "ink"}
        onChange={(on) => setPalette(on ? "ink" : "forest")}
      />
    </div>
  );
}
