export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export const mockTeam: TeamMember[] = [
  { id: "andi_designer", name: "Andi Designer", avatar: "A", role: "UI/UX Designer" },
  { id: "siti_ui", name: "Siti UI", avatar: "S", role: "UI Designer" },
  { id: "rina_ui", name: "Rina UI", avatar: "R", role: "UX Designer" },
  { id: "budi_dev", name: "Budi Dev", avatar: "B", role: "Frontend Dev" },
  { id: "siti_hr", name: "Siti HR", avatar: "S", role: "HR Representative" },
  { id: "tim_hr", name: "Tim HR", avatar: "T", role: "HR Team" },
  { id: "tim_design", name: "Tim Design", avatar: "T", role: "Design Team" },
];

export function getMember(id: string): TeamMember | undefined {
  return mockTeam.find((m) => m.id === id);
}

export function getMemberName(id: string | null): string {
  if (!id) return "Belum ditugaskan";
  const member = getMember(id);
  return member ? member.name : id.replace("_", " ");
}
