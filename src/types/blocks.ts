export type BlockType =
  | "work_experience"
  | "project"
  | "education"
  | "volunteering"
  | "research";

export interface ExperienceBlock {
  id: string;
  user_id: string;
  type: BlockType;
  title: string;
  organization: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  bullet_points: string[];
  technologies: string[];
  metadata: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateBlockInput = Omit<
  ExperienceBlock,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type UpdateBlockInput = Partial<CreateBlockInput>;
