import { fetchProjects } from "@/lib/actions";
import Dashboard from "@/components/Dashboard";
import Masthead from "@/components/Masthead";

export const dynamic = "force-dynamic";

export default async function Page() {
  const projects = await fetchProjects();
  return (
    <>
      <Masthead />
      <Dashboard initialProjects={projects} />
    </>
  );
}
