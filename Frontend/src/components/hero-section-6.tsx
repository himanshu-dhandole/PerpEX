// components/hero-section-6.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, SendHorizonal } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-32">
        <div className="lg:flex lg:items-center lg:gap-12">
          {/* Left Content */}
          <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
            <Link
              to="/"
              className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0"
            >
              <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                New
              </span>
              <span className="text-sm">Introduction Tailark Html</span>
              <span className="bg-(--color-border) block h-4 w-px" />
              <ArrowRight className="size-4" />
            </Link>

            <h1 className="mt-10 text-4xl font-bold md:text-5xl xl:text-6xl text-balance">
              Production Ready Digital Marketing Blocks
            </h1>
            <p className="mt-6 text-muted-foreground">
              Error totam sit illum. Voluptas doloribus asperiores quaerat
              aperiam. Quidem harum omnis beatae ipsum soluta!
            </p>

            {/* Email Form */}
            <form
              action=""
              className="mx-auto my-10 max-w-sm lg:ml-0 lg:mr-auto"
            >
              <div className="relative grid grid-cols-[1fr_auto] items-center rounded-xl border pr-1 shadow has-[input:focus]:ring-2 has-[input:focus]:ring-muted">
                <Mail className="pointer-events-none absolute inset-y-0 left-5 my-auto size-5 text-muted-foreground" />
                <input
                  placeholder="Your mail address"
                  className="h-14 w-full bg-transparent pl-12 focus:outline-none"
                  type="email"
                />
                <Button aria-label="submit" className="md:pr-2">
                  <span className="hidden md:block">Get Started</span>
                  <SendHorizonal className="md:hidden size-5" />
                </Button>
              </div>
            </form>

            <ul className="list-inside list-disc space-y-2 text-left mx-auto lg:mx-0">
              <li>Faster</li>
              <li>Modern</li>
              <li>100% Customizable</li>
            </ul>
          </div>  
        </div>
      </div>
    </section>
  );
}
