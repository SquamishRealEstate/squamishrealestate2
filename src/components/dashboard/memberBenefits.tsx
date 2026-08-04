import React from "react";
import {
  Users,
  Sparkles,
  TrendingUp,
  FileText,
  Landmark,
  Map,
  Images,
  BadgeDollarSign,
} from "lucide-react";

export const MemberBenefits = () => {
  return (
    <section className="@container w-full">
      <div className="w-full">
        {/* Section Header */}
        <div className="mb-8 max-w-3xl @2xl:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Member Benefits
          </span>

          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-balance text-foreground @xl:text-3xl @4xl:text-4xl">
            More than just a real estate search.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-pretty text-muted-foreground">
            Get exclusive access to Squamish property data, intelligent search
            tools, historical records, and benefits designed to make your real
            estate journey easier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @2xl:gap-5 @5xl:grid-cols-4 @5xl:gap-6 @5xl:auto-rows-[240px]">
          <div className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform duration-500 hover:-translate-y-1 @2xl:col-span-2 @2xl:min-h-[420px] @2xl:p-8 @5xl:col-span-2 @5xl:row-span-2">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('/images/dashboard/Squamish-7.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />

            <div className="relative z-10 flex w-full items-end justify-between gap-6">
              <div className="max-w-lg">
                <h3 className="mb-3 font-display text-2xl leading-tight text-foreground @2xl:text-3xl">
                  Free Real Estate Consultation
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                  Connect with real estate experts for personalized guidance on
                  your buying, selling, or investment goals in Squamish.
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-border bg-background/60 p-3 backdrop-blur-md">
                <Users className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-xl transition-transform duration-500 hover:-translate-y-1 @2xl:col-span-2 @2xl:min-h-[240px] @2xl:p-8 @5xl:col-span-2 @5xl:row-span-1">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/25 blur-3xl" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl leading-tight text-white">
                Squamish AI Property Search
              </h3>
              <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <Sparkles
                  className="h-5 w-5 text-secondary"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="relative z-10">
              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                Free unlimited use of our advanced AI tools to find your perfect
                Squamish home faster.
              </p>
            </div>
          </div>

          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary to-[oklch(0.38_0.07_175)] p-6 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-500 hover:-translate-y-1 @5xl:col-span-1 @5xl:row-span-1">
            {/* Rising bars motif */}
            <div className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-1.5 p-5 opacity-40">
              <span className="h-6 w-2 rounded-full bg-primary-foreground/60" />
              <span className="h-9 w-2 rounded-full bg-primary-foreground/70" />
              <span className="h-14 w-2 rounded-full bg-primary-foreground/90" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                +12.4% YoY
              </span>
              <div className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 p-2.5">
                <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="mb-2 font-display text-xl leading-tight">
                Historical
                <br />
                Sold Prices
              </h3>
              <p className="text-xs leading-relaxed text-primary-foreground/75">
                Free access to sold data for all Squamish properties.
              </p>
            </div>
          </div>
          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-secondary to-[oklch(0.38_0.06_245)] p-6 text-secondary-foreground shadow-lg shadow-secondary/20 transition-transform duration-500 hover:-translate-y-1 @5xl:col-span-1 @5xl:row-span-1">
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-secondary-foreground/10 blur-2xl" />

            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded-full bg-secondary-foreground/15 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                Assessment Overview
              </span>
              <div className="rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 p-2.5">
                <FileText className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="mb-2 font-display text-xl leading-tight">
                BC Assessment
                <br />
                Values
              </h3>
              <p className="text-xs leading-relaxed text-secondary-foreground/75">
                Historical assessment records and trends across Squamish.
              </p>
            </div>
          </div>

          <div className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-sm transition-transform duration-500 hover:-translate-y-1 @2xl:col-span-2 @2xl:min-h-[420px] @5xl:col-span-2 @5xl:row-span-2">
            <div className="grid h-[65%] w-full grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-[1.5rem]">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.01]"
                  style={{
                    backgroundImage: `url('/images/dashboard/Squamish-${n}.jpg')`,
                  }}
                />
              ))}
            </div>

            <div className="flex flex-1 items-end justify-between gap-5 px-5 pb-4 pt-4">
              <div>
                <h3 className="mb-2 font-display text-2xl leading-tight text-foreground">
                  Property &amp; Neighbourhood Photos
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Free access to over 100,000 Squamish property and
                  neighbourhood images.
                </p>
              </div>

              <div className="hidden shrink-0 rounded-full border border-primary/20 bg-primary p-3 sm:block">
                <Images
                  className="h-5 w-5 text-primary-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>

          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-primary/[0.07] p-6 shadow-sm transition-transform duration-500 hover:-translate-y-1 @5xl:col-span-1 @5xl:row-span-1">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative z-10 flex justify-end">
              <div className="rounded-full border border-primary/20 bg-card p-2.5 shadow-sm">
                <Landmark className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="mb-2 font-display text-xl leading-tight text-foreground">
                Property Tax
                <br />
                History
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Free access to past tax values for Squamish real estate.
              </p>
            </div>
          </div>

          {/* =========================================================
              7. DETAILED FLOOR PLANS  (1 x 1) — blueprint card
          ========================================================= */}
          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-[oklch(0.32_0.05_240)] to-[oklch(0.22_0.03_245)] p-6 text-white shadow-lg shadow-secondary/20 transition-transform duration-500 hover:-translate-y-1 @5xl:col-span-1 @5xl:row-span-1">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative z-10 flex justify-end">
              <div className="rounded-full border border-white/15 bg-white/10 p-2.5">
                <Map className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="mb-2 font-display text-xl leading-tight">
                Detailed
                <br />
                Floor Plans
              </h3>
              <p className="text-xs leading-relaxed text-white/65">
                Free access to over 3,000 Squamish property floor plans.
              </p>
            </div>
          </div>

          <div className="group relative flex min-h-[200px] flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-accent/40 bg-gradient-to-br from-accent to-accent p-6 text-accent-foreground shadow-lg shadow-accent/25 transition-transform duration-500 hover:-translate-y-1 @2xl:col-span-2 @2xl:min-h-[240px] @2xl:p-8 @5xl:col-span-2 @5xl:row-span-1">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08] mix-blend-overlay"
              style={{
                backgroundImage: "url('/images/dashboard/Squamish-5.jpg')",
              }}
            />
            <div className="pointer-events-none absolute -bottom-10 right-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl leading-tight text-accent-foreground">
                Transaction Cashback
              </h3>
              <div className="shrink-0 rounded-full border border-accent-foreground/20 bg-background/25 p-2.5 backdrop-blur-sm">
                <BadgeDollarSign
                  className="h-5 w-5 text-accent-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="relative z-10 mt-4 flex items-end gap-4">
              <span className="font-display text-4xl font-semibold leading-none text-accent-foreground">
                $1,000
              </span>
              <div className="pb-0.5">
                <p className="text-sm font-medium text-accent-foreground">
                  cashback credit on your next transaction
                </p>
                <p className="text-xs italic text-accent-foreground/70">
                  *$1,000 or 10% of commission earned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
