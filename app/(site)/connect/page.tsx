import { ConnectPanel } from "@/components/ConnectPanel";

export const metadata = {
  title: "Connect · Human Agent IoC Patterns",
  description:
    "Generate a prompt that sets up the HAX pattern MCP server in your coding agent automatically.",
};

export default function ConnectPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-20">
      <ConnectPanel />
    </main>
  );
}
