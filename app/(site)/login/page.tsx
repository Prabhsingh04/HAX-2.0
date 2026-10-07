import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "Sign in · Human Agent IoC Patterns",
  description: "Sign in by email to keep your chat history private and persistent.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-20">
      <LoginForm />
    </main>
  );
}
