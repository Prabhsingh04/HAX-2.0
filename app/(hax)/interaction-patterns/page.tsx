import { redirect } from "next/navigation";

// The list of interaction patterns lives at /patterns; only each pattern's page lives here.
export default function Page() {
  redirect("/patterns");
}
