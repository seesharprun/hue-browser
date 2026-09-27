"use client";

export type WizardStep = { label: string; enabled: boolean };

/**
 * The whole app is one wizard: connect to a bridge, then browse devices. Any
 * reachable step stays clickable so a wrong turn is one click from undone.
 * The label stays in normal flow for layout while an overlay button covers the
 * marker and the label, which daisyUI draws as a pseudo-element.
 */
export function WizardSteps({
  steps,
  current,
  onGo,
}: {
  steps: WizardStep[];
  current: number;
  onGo: (index: number) => void;
}) {
  return (
    <ul className="steps steps-horizontal w-full text-sm">
      {steps.map((step, index) => {
        const clickable = step.enabled && index !== current;
        return (
          <li
            key={step.label}
            className={`step relative ${index <= current ? "step-primary" : ""}`}
            data-content={index < current ? "✓" : undefined}
          >
            <span
              aria-current={index === current ? "step" : undefined}
              className={clickable ? "link link-hover" : undefined}
            >
              {step.label}
            </span>
            {clickable && (
              <button
                type="button"
                className="absolute inset-0 z-2 cursor-pointer"
                onClick={() => onGo(index)}
              >
                <span className="sr-only">Go to the {step.label} step</span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
