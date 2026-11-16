"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// AI Elements Suggestion (built on shadcn/ui): a rounded outline Button for a ready-made ask
function Suggestions({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full overflow-x-auto whitespace-nowrap", className)} {...props}>
      <div className="flex w-max flex-nowrap items-center gap-2">{children}</div>
    </div>
  );
}

function Suggestion({ className, variant = "outline", size = "sm", ...props }: React.ComponentProps<typeof Button>) {
  return <Button className={cn("cursor-pointer rounded-full px-4", className)} size={size} type="button" variant={variant} {...props} />;
}

export { Suggestions, Suggestion };
