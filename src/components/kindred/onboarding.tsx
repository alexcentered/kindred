import { useState } from "react";
import { INTERESTS, SKILL_POOL } from "@/lib/kindred/seed";
import { useKindred } from "@/lib/kindred/store";
import { Button, Chip, Field } from "./ui";

export function Onboarding() {
  const complete = useKindred((s) => s.completeOnboarding);
  const skip = useKindred((s) => s.skipOnboarding);
  const you = useKindred((s) => s.you());
  const [step, setStep] = useState(0);
  const [name, setName] = useState(you.name);
  const [neighborhood, setNeighborhood] = useState(you.neighborhood);
  const [interests, setInterests] = useState<string[]>(you.interests);
  const [skills, setSkills] = useState<string[]>(you.skills);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) => {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 onboard-pad">
      <p className="shrink-0 text-xs font-medium uppercase tracking-[0.22em] text-muted">Kindred</p>
      <div className="stagger-in mt-6 min-h-0 flex-1 overflow-y-auto">
        {step === 0 ? (
          <>
            <h1 className="font-display text-4xl leading-tight tracking-tight text-fg">
              Find your people. Share what you have.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
              A place for neighbors to request help, offer skills, and gather in real life — without the
              feed getting in the way.
            </p>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-fg">What are you into?</h1>
            <p className="mt-2 text-sm text-muted">We use this to surface people and posts nearby.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {INTERESTS.map((tag) => (
                <Chip key={tag} active={interests.includes(tag)} onClick={() => toggle(interests, tag, setInterests)}>
                  {tag.replace("-", " ")}
                </Chip>
              ))}
            </div>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-fg">What can you offer?</h1>
            <p className="mt-2 text-sm text-muted">Skills help neighbors find you when they need a hand.</p>
            <div className="mt-4 flex flex-col gap-3">
              <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <Field
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Neighborhood"
              />
            </div>
            <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
              {SKILL_POOL.map((skill) => (
                <Chip key={skill} active={skills.includes(skill)} onClick={() => toggle(skills, skill, setSkills)}>
                  {skill}
                </Chip>
              ))}
            </div>
          </>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col gap-2 bg-bg-elevated pt-4 safe-pad-bottom">
        {step < 2 ? (
          <Button size="lg" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => complete({ name, neighborhood, interests, skills })}
          >
            Enter Kindred
          </Button>
        )}
        <Button variant="ghost" onClick={skip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
