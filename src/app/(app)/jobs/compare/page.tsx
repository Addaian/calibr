"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobPosting, Compensation } from "@/types/jobs";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const OFFER_STATUSES = ["offer", "negotiating", "accepted"];

function fmtUSD(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function year1(c: Compensation): number {
  const vest = c.rsu_vest_years ?? 4;
  return (c.base ?? 0) + (c.signing_bonus ?? 0) + (c.rsus ?? 0) / vest + (c.relocation ?? 0);
}

function steady(c: Compensation): number {
  const vest = c.rsu_vest_years ?? 4;
  return (c.base ?? 0) + (c.rsus ?? 0) / vest;
}

interface RowProps {
  label: string;
  values: (number | undefined)[];
  highlight?: boolean;
  format?: (v: number | undefined) => string;
}

function Row({ label, values, highlight, format = fmtUSD }: RowProps) {
  const defined = values.filter((v): v is number => v !== undefined);
  const max = defined.length > 0 ? Math.max(...defined) : null;

  return (
    <tr className={highlight ? "border-t font-semibold" : ""}>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-2.5 px-3 text-center text-sm ${
            v !== undefined && max !== null && v === max && defined.length > 1
              ? "text-green-700 dark:text-green-400"
              : ""
          } ${highlight ? "text-base" : ""}`}
        >
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  const { data: jobs, isLoading } = useSWR<JobPosting[]>("/api/jobs", fetcher);

  const offers = (jobs ?? []).filter(
    (j) => OFFER_STATUSES.includes(j.status) && j.compensation
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Offer Comparison</h1>
          <p className="text-sm text-muted-foreground">
            Comparing {offers.length} offer{offers.length !== 1 ? "s" : ""} with structured compensation
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
          <p className="text-sm font-medium">No offers with compensation data yet</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Set a job status to Offer or Negotiating and fill in the Compensation section to compare.
          </p>
          <Button asChild size="sm" className="mt-1">
            <Link href="/jobs">View jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" />
                {offers.map((job) => (
                  <th key={job.id} className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-semibold">{job.company ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{job.title}</span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        View
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <Row
                label="Base Salary"
                values={offers.map((j) => j.compensation?.base)}
              />
              <Row
                label="Signing Bonus"
                values={offers.map((j) => j.compensation?.signing_bonus)}
              />
              <Row
                label={`RSUs (${offers[0]?.compensation?.rsu_vest_years ?? 4}-yr vest)`}
                values={offers.map((j) => j.compensation?.rsus)}
              />
              <Row
                label="Relocation"
                values={offers.map((j) => j.compensation?.relocation)}
              />
              <Row
                label="Year 1 Total"
                values={offers.map((j) => j.compensation ? year1(j.compensation) : undefined)}
                highlight
              />
              <Row
                label="Annual (steady state)"
                values={offers.map((j) => j.compensation ? steady(j.compensation) : undefined)}
                highlight
              />
              {offers.some((j) => j.compensation?.other) && (
                <tr>
                  <td className="py-2.5 pr-4 text-sm text-muted-foreground">Notes</td>
                  {offers.map((j) => (
                    <td key={j.id} className="py-2.5 px-3 text-center text-xs text-muted-foreground">
                      {j.compensation?.other ?? "—"}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
