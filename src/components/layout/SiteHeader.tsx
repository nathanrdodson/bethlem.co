import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.svg"
            alt="Bethlem"
            width={28}
            height={28}
            className="invert"
          />
          <span className="font-semibold tracking-tight">Bethlem</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href={process.env.DISCOURSE_BASE_URL ?? "https://forum.bethlem.co"}
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Forum
          </Link>

          {user ? (
            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="outline"
                className="h-7 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Sign out
              </Button>
            </form>
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-coral hover:bg-coral/90 border-transparent"
              )}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
