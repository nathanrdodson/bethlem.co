import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Authentication error" };

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-2xl font-semibold">Sign-in failed</h1>
        <p className="text-muted-foreground text-sm">
          The sign-in link may have expired or already been used. Please try
          again.
        </p>
        <Link href="/auth/login" className={cn(buttonVariants(), "inline-flex")}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
