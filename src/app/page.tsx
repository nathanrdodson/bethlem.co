import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const forumUrl =
    process.env.DISCOURSE_BASE_URL ?? "https://forum.bethlem.co";

  return (
    <div className="flex flex-col items-center justify-center gap-10 px-4 py-24 text-center">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          Bethlem Myopathy Community
        </h1>
        <p className="text-lg text-muted-foreground">
          A space for people living with Bethlem Myopathy, their families, and
          carers to connect, share experiences, and find support.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href={forumUrl}
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-coral hover:bg-coral/90 border-transparent"
          )}
        >
          Go to the forum
        </Link>
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Sign in
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 text-left max-w-3xl w-full mt-4">
        {[
          {
            title: "Connect",
            body: "Meet others who understand the day-to-day realities of living with Bethlem Myopathy.",
          },
          {
            title: "Share",
            body: "Exchange tips, research updates, and personal experiences in a supportive environment.",
          },
          {
            title: "Learn",
            body: "Stay up to date on clinical trials, specialist centres, and newly published research.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-lg border bg-card p-5 space-y-2">
            <h2 className="font-semibold text-navy">{title}</h2>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
