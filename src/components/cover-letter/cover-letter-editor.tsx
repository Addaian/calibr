"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

interface CoverLetterEditorProps {
  content: string;
  onContentChange?: (content: string) => void;
}

export function CoverLetterEditor({
  content,
  onContentChange,
}: CoverLetterEditorProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Cover Letter</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => onContentChange?.(e.target.value)}
          className="min-h-[400px] resize-y font-serif text-sm leading-relaxed"
        />
      </CardContent>
    </Card>
  );
}
