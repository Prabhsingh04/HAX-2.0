"use client";

import { useEffect, useState } from "react";
import { PatternAdvisor } from "@/components/PatternAdvisor";
import { AuthBadge } from "@/components/AuthBadge";

export function AdvisorLauncher() {
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt")?.trim();
    if (prompt) setInitialPrompt(prompt);
  }, []);

  return (
    <div className="relative flex h-full flex-col">
      <AuthBadge />
      <PatternAdvisor initialPrompt={initialPrompt} />
    </div>
  );
}
