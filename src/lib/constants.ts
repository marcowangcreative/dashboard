import type { Category, Status } from "./types";

export const CATEGORIES: Category[] = ["photo", "hair", "weddings", "misc"];

export const CATEGORY_LABEL: Record<Category, string> = {
  photo:    "Photo",
  hair:     "Hair",
  weddings: "Weddings",
  misc:     "Misc",
};

export const CATEGORY_LONG: Record<Category, string> = {
  photo:    "Photo (MWP)",
  hair:     "Hair (Flowe Collective)",
  weddings: "Weddings (joint)",
  misc:     "Misc",
};

export const STATUSES: Status[] = ["idea", "building", "live", "shelved"];

export const STATUS_LABEL: Record<Status, string> = {
  idea:     "Idea",
  building: "Building",
  live:     "Live",
  shelved:  "Shelved",
};

export const LINK_TYPES = [
  { key: "live",   label: "Live"   },
  { key: "repo",   label: "Repo"   },
  { key: "admin",  label: "DB"     },
  { key: "host",   label: "Host"   },
  { key: "design", label: "Design" },
  { key: "docs",   label: "Docs"   },
] as const;

export type LinkKey = typeof LINK_TYPES[number]["key"];
