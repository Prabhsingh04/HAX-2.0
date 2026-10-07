import { AccessSignup } from "@/components/AccessSignup";

export const metadata = {
  title: "Get Access · Human Agent IoC Patterns",
  description:
    "Sign up with your email to receive a personal access token for the hosted IoC pattern MCP server.",
};

export default function AccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-20">
      <AccessSignup />
    </main>
  );
}
