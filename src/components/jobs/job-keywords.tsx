"use client";

import { Badge } from "@/components/ui/badge";

interface JobKeywordsProps {
  keywords: string[];
  required_skills: string[];
  preferred_skills: string[];
}

export function JobKeywords({
  keywords,
  required_skills,
  preferred_skills,
}: JobKeywordsProps) {
  const hasAny =
    keywords.length > 0 ||
    required_skills.length > 0 ||
    preferred_skills.length > 0;

  if (!hasAny) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {required_skills.map((skill) => (
        <Badge key={`req-${skill}`} variant="destructive">
          {skill}
        </Badge>
      ))}
      {preferred_skills.map((skill) => (
        <Badge key={`pref-${skill}`} variant="secondary">
          {skill}
        </Badge>
      ))}
      {keywords.map((keyword) => (
        <Badge key={`kw-${keyword}`} variant="outline">
          {keyword}
        </Badge>
      ))}
    </div>
  );
}
