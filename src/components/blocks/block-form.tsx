"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExperienceBlock, BlockType } from "@/types/blocks";

const blockTypeOptions: { value: BlockType; label: string }[] = [
  { value: "work_experience", label: "Work Experience" },
  { value: "project", label: "Project" },
  { value: "education", label: "Education" },
  { value: "research", label: "Research" },
  { value: "skill", label: "Skill" },
  { value: "volunteering", label: "Volunteering" },
];

type FieldConfig = {
  titleLabel: string;
  titlePlaceholder: string;
  orgLabel: string;
  orgPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  showLocation: boolean;
  showDates: boolean;
};

const fieldConfigs: Record<BlockType, FieldConfig> = {
  work_experience: {
    titleLabel: "Job Title",
    titlePlaceholder: "e.g. Software Engineer",
    orgLabel: "Company",
    orgPlaceholder: "e.g. Acme Corp",
    locationLabel: "Location",
    locationPlaceholder: "e.g. San Francisco, CA",
    showLocation: true,
    showDates: true,
  },
  project: {
    titleLabel: "Project Name",
    titlePlaceholder: "e.g. Open Source CLI Tool",
    orgLabel: "Organization",
    orgPlaceholder: "e.g. Personal, MIT",
    locationLabel: "Location",
    locationPlaceholder: "",
    showLocation: false,
    showDates: true,
  },
  education: {
    titleLabel: "Degree / Program",
    titlePlaceholder: "e.g. B.Sc. Computer Science",
    orgLabel: "Institution",
    orgPlaceholder: "e.g. MIT",
    locationLabel: "Location",
    locationPlaceholder: "e.g. Cambridge, MA",
    showLocation: true,
    showDates: true,
  },
  research: {
    titleLabel: "Research Role",
    titlePlaceholder: "e.g. Research Assistant",
    orgLabel: "Professor / Supervisor",
    orgPlaceholder: "e.g. Prof. Jane Smith",
    locationLabel: "Institution",
    locationPlaceholder: "e.g. MIT",
    showLocation: true,
    showDates: true,
  },
  skill: {
    titleLabel: "Skill Category",
    titlePlaceholder: "e.g. Programming Languages",
    orgLabel: "Organization",
    orgPlaceholder: "",
    locationLabel: "Location",
    locationPlaceholder: "",
    showLocation: false,
    showDates: false,
  },
  volunteering: {
    titleLabel: "Role",
    titlePlaceholder: "e.g. Mentor",
    orgLabel: "Organization",
    orgPlaceholder: "e.g. Code.org",
    locationLabel: "Location",
    locationPlaceholder: "e.g. San Francisco, CA",
    showLocation: true,
    showDates: true,
  },
};

interface BlockFormProps {
  initialData?: Partial<ExperienceBlock>;
  onSubmit: (data: Record<string, unknown>) => void;
  loading?: boolean;
}

export function BlockForm({ initialData, onSubmit, loading }: BlockFormProps) {
  const [type, setType] = useState<BlockType>(initialData?.type ?? "work_experience");
  const config = fieldConfigs[type];
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [organization, setOrganization] = useState(initialData?.organization ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [startDate, setStartDate] = useState(initialData?.start_date ?? "");
  const [endDate, setEndDate] = useState(initialData?.end_date ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [bulletPoints, setBulletPoints] = useState<string[]>(
    initialData?.bullet_points ?? [""]
  );
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies ?? [""]
  );
  const [gpa, setGpa] = useState(
    (initialData?.metadata?.gpa as string) ?? ""
  );
  const [coursework, setCoursework] = useState(
    (initialData?.metadata?.coursework as string) ?? ""
  );
  const [certifications, setCertifications] = useState(
    (initialData?.metadata?.certifications as string) ?? ""
  );
  const [researchTopic, setResearchTopic] = useState(
    (initialData?.metadata?.research_topic as string) ?? ""
  );

  function addBulletPoint() {
    setBulletPoints([...bulletPoints, ""]);
  }

  function removeBulletPoint(index: number) {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index));
  }

  function updateBulletPoint(index: number, value: string) {
    const updated = [...bulletPoints];
    updated[index] = value;
    setBulletPoints(updated);
  }

  function addTechnology() {
    setTechnologies([...technologies, ""]);
  }

  function removeTechnology(index: number) {
    setTechnologies(technologies.filter((_, i) => i !== index));
  }

  function updateTechnology(index: number, value: string) {
    const updated = [...technologies];
    updated[index] = value;
    setTechnologies(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const metadata: Record<string, unknown> = {
      ...(initialData?.metadata ?? {}),
    };

    if (type === "education") {
      if (gpa) metadata.gpa = gpa;
      if (coursework) metadata.coursework = coursework;
    }

    if (type === "skill") {
      if (certifications) metadata.certifications = certifications;
    }

    if (type === "research") {
      if (researchTopic) metadata.research_topic = researchTopic;
    }

    onSubmit({
      type,
      title,
      organization: organization || null,
      location: location || null,
      start_date: startDate || null,
      end_date: endDate || null,
      description: description || null,
      bullet_points: bulletPoints.filter((bp) => bp.trim() !== ""),
      technologies: technologies.filter((tech) => tech.trim() !== ""),
      metadata,
      sort_order: initialData?.sort_order ?? 0,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Block Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BlockType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {blockTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{config.titleLabel}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={config.titlePlaceholder}
                required
              />
            </div>
            {config.orgLabel && (
              <div className="space-y-2">
                <Label htmlFor="organization">{config.orgLabel}</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={config.orgPlaceholder}
                />
              </div>
            )}
          </div>

          {(config.showLocation || config.showDates) && (
            <div className="grid gap-4 sm:grid-cols-3">
              {config.showLocation && (
                <div className="space-y-2">
                  <Label htmlFor="location">{config.locationLabel}</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={config.locationPlaceholder}
                  />
                </div>
              )}
              {config.showDates && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Bullet Points</Label>
            <div className="space-y-2">
              {bulletPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={point}
                    onChange={(e) => updateBulletPoint(index, e.target.value)}
                    placeholder="Describe an achievement or responsibility..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeBulletPoint(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBulletPoint}
            >
              <Plus />
              Add bullet
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="space-y-2">
              {technologies.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={tech}
                    onChange={(e) => updateTechnology(index, e.target.value)}
                    placeholder="e.g. React, Python, AWS..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeTechnology(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTechnology}
            >
              <Plus />
              Add technology
            </Button>
          </div>

          {type === "education" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g. 3.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coursework">Relevant Coursework</Label>
                <Textarea
                  id="coursework"
                  value={coursework}
                  onChange={(e) => setCoursework(e.target.value)}
                  placeholder="List relevant courses..."
                  rows={3}
                />
              </div>
            </>
          )}

          {type === "skill" && (
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="List relevant certifications..."
                rows={3}
              />
            </div>
          )}

          {type === "research" && (
            <div className="space-y-2">
              <Label htmlFor="research_topic">Research Topic / Area</Label>
              <Input
                id="research_topic"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="e.g. Natural Language Processing, Computer Vision"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving..." : initialData?.id ? "Update Block" : "Create Block"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
