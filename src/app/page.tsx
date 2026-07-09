import { cookies } from "next/headers";
import { DashboardNavbar } from "@/components/auth/dashboard-navbar";
import { ProjectList } from "@/components/dashboard/project-list";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ContinueWorkingCard } from "@/components/dashboard/continue-working-card";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ProjectItem } from "@/components/dashboard/types";
import { UploadStatusBanner } from "@/components/dashboard/upload-status-banner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function fetchProjects(): Promise<ProjectItem[]> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${BASE_URL}/api/projects`, { 
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const projects = await fetchProjects();

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-canvas text-ink">
      <DashboardNavbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 0. Upload Status Banner (Global Processing State) */}
        <UploadStatusBanner />

        {/* 1. Header & Primary Actions */}
        <DashboardHeader />

        {/* 2. Continue Working */}
        <ContinueWorkingCard projects={projects} />

        {/* 3. Today's Overview (Key Metrics) */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl md:text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">Today's Overview</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-hairline to-transparent" />
          </div>
          <OverviewCards projects={projects} />
        </section>

        {/* 4. Operational Insights */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl md:text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">Insights</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-hairline to-transparent" />
          </div>
          <InsightsPanel projects={projects} />
        </section>

        {/* 5. Projects Explorer */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl md:text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">Projects Explorer</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/10 text-ink">
              {projects.length}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-hairline to-transparent" />
          </div>
          <ProjectList projects={projects} />
        </section>

      </main>
    </div>
  );
}
