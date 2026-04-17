export type Category = "photo" | "hair" | "weddings" | "misc";
export type Status   = "idea" | "building" | "live" | "shelved";

export type Links = {
  live?:   string;
  repo?:   string;
  admin?:  string;
  host?:   string;
  design?: string;
  docs?:   string;
};

export type Project = {
  id: string;
  title: string;
  tagline: string;
  category: Category;
  status: Status;
  stack: string[];
  links: Links;
  related: string[];
  next_action: string;
  notes: string;
  local_path: string;
  sort_order: number;
  updated_at: string;
};

export type ProjectInput = Omit<Project, "updated_at">;
