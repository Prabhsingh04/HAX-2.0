import { notFound } from "next/navigation";

// Any /v4 address no page claims: show v6's own 404 (../not-found.tsx).
export default function Missing() {
  notFound();
}
