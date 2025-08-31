import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <main className="relative overflow-hidden">
      {/* Aurora Grid Background */}
      <div
        className="absolute inset-0 max-md:hidden top-[400px] -z-10 h-[400px] w-full
        bg-transparent 
        bg-[linear-gradient(to_right,#57534e_1px,transparent_1px),linear-gradient(to_bottom,#57534e_1px,transparent_1px)]
        bg-[size:3rem_3rem]
        opacity-20
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]
        dark:bg-[linear-gradient(to_right,#a8a29e_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e_1px,transparent_1px)]"
      />

      {/* Main Hero Content */}
      <section
        id="home"
        className="flex flex-col items-center justify-center px-6 text-center relative z-10"
      >
        {/* Promo Badge */}
        <div className="mb-6 mt-10 sm:justify-center md:mb-4 md:mt-40">
          <div className="relative flex items-center rounded-full border bg-popover px-3 py-1 text-xs text-primary/60">
            Introducing Dicons.
            <Link
              to="/products/dicons"
              className="ml-1 flex items-center font-semibold relative z-10"
            >
              Explore
            </Link>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="mx-auto max-w-5xl border-text-red-500 relative bg-background border py-12 p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)]">
          {/* Decorative Plus Icons */}
          <Plus className="absolute -left-5 -top-5 h-10 w-10 text-text-red-500" strokeWidth={4} />
          <Plus className="absolute -bottom-5 -left-5 h-10 w-10 text-text-red-500" strokeWidth={4} />
          <Plus className="absolute -right-5 -top-5 h-10 w-10 text-text-red-500" strokeWidth={4} />
          <Plus className="absolute -bottom-5 -right-5 h-10 w-10 text-text-red-500" strokeWidth={4} />

          <h1 className="flex flex-col text-center text-5xl font-semibold leading-none tracking-tight md:text-8xl lg:flex-row lg:text-8xl">
            Your complete platform for the{" "}
            <span className="text-red-500">Design.</span>
          </h1>

          {/* Availability Badge */}
          <div className="flex items-center justify-center mt-4 gap-1">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-xs text-green-500">Available Now</p>
          </div>
        </div>

        {/* Intro Text */}
        <h2 className="mt-8 text-2xl md:text-2xl">
          Welcome to my creative playground! I&apos;m{" "}
          <span className="text-red-500 font-bold">Ali</span>
        </h2>
        <p className="text-primary/60 py-4 max-w-3xl">
          I craft enchanting visuals for brands and create design resources to
          empower others. I am an expert in design, including Graphic Design,
          Branding, Web Design, Web Development, Marketing, UI/UX, and Social Media.
        </p>

        {/* Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Link to="/graphic">
            <Button className="rounded-xl w-full sm:w-auto">Start Posting</Button>
          </Link>
          <Link to="https://cal.com/aliimam/designali" target="_blank">
            <Button className="rounded-xl w-full sm:w-auto" variant="outline">
              Book a Call
            </Button>
          </Link>
        </div>
      </section>

      {/* Canvas for any custom effects */}
      <canvas className="pointer-events-none absolute inset-0 mx-auto" id="canvas" />

      {/* Background Image */}
      <img
        width={1512}
        height={550}
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2"
        src="https://raw.githubusercontent.com/designali-in/designali/refs/heads/main/apps/www/public/images/gradient-background-top.png"
        alt=""
        role="presentation"
      />
    </main>
  );
};
