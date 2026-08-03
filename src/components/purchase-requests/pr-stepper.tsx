import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PurchaseRequestStatus } from "@/modules/purchase-requests";

const steps = ["Submitted", "Sourcing & Fulfillment", "Completed"] as const;

/** How far along the three-step track a status sits. */
function currentStep(status: PurchaseRequestStatus) {
  switch (status) {
    case "completed":
      return 3;
    case "canvassing":
    case "po-created":
    case "partially-completed":
      return 1;
    default:
      return 0;
  }
}

export function PurchaseRequestStepper({
  status,
}: {
  status: PurchaseRequestStatus;
}) {
  const active = currentStep(status);

  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const isComplete = index < active;
        const isCurrent = index === active;

        return (
          <li
            key={step}
            className="flex flex-1 items-start"
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border-2 text-xs",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete &&
                    !isCurrent &&
                    "border-muted text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <CheckIcon className="size-3" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "text-center text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mt-3 h-0.5 flex-1",
                  isComplete ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
