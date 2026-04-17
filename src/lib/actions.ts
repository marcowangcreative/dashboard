"use server";

import { revalidatePath } from "next/cache";
import { serverClient } from "./supabase";
import { uid } from "./utils";
import type { Project, ProjectInput } from "./types";

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await serverClient()
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("fetchProjects error", error);
    return [];
  }
  return (data || []) as Project[];
}

export async function upsertProject(input: ProjectInput): Promise<void> {
  const payload = {
    ...input,
    id: input.id || `user/${uid()}`,
  };
  const { error } = await serverClient()
    .from("projects")
    .upsert(payload, { onConflict: "id" });
  if (error) {
    console.error("upsertProject error", error);
    throw new Error(error.message);
  }
  revalidatePath("/");
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await serverClient()
    .from("projects")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("deleteProject error", error);
    throw new Error(error.message);
  }
  revalidatePath("/");
}

/** Reciprocal relationship sync: when project X says it relates to Y,
 *  make sure Y lists X back. */
export async function syncRelationships(
  thisId: string,
  related: string[]
): Promise<Project[]> {
  const all = await fetchProjects();
  const others = all.filter(p => p.id !== thisId);
  const updates = others
    .map(other => {
      const hasMe = (other.related || []).includes(thisId);
      const iHaveThem = related.includes(other.id);
      if (iHaveThem && !hasMe) {
        return { ...other, related: [...(other.related || []), thisId] };
      }
      if (!iHaveThem && hasMe) {
        return { ...other, related: (other.related || []).filter(r => r !== thisId) };
      }
      return null;
    })
    .filter(Boolean) as Project[];

  if (updates.length === 0) return [];
  const { error } = await serverClient()
    .from("projects")
    .upsert(updates, { onConflict: "id" });
  if (error) {
    console.error("syncRelationships error", error);
    throw new Error(error.message);
  }
  revalidatePath("/");
  return updates;
}
