"use client";

import type { TailoredContent } from "@/types/resumes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TailoringPreviewProps {
  content: TailoredContent;
}

function formatDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function TailoringPreview({ content }: TailoringPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resume Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {content.summary && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Professional Summary
            </h3>
            <p className="text-sm leading-relaxed">{content.summary}</p>
          </div>
        )}

        <Separator />

        {content.blocks.map((block, index) => (
          <div key={block.block_id || index}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{block.title}</h4>
                {block.organization && (
                  <p className="text-sm text-muted-foreground">
                    {block.organization}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {block.start_date && (
                  <span>
                    {formatDate(block.start_date)} – {formatDate(block.end_date)}
                  </span>
                )}
              </div>
            </div>

            {block.bullet_points.length > 0 && (
              <ul className="ml-4 list-disc space-y-1">
                {block.bullet_points.map((bp, i) => (
                  <li key={i} className="text-sm">
                    {bp}
                  </li>
                ))}
              </ul>
            )}

            {block.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {block.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}

            {index < content.blocks.length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
