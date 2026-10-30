import { z } from "zod";
export const clientSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(60),
  company: z.string().trim().min(2).max(80),
  email: z.email("Enter a valid email address"),
  status: z.enum(["Active", "Lead", "Inactive"]),
});
export const projectSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(240),
  clientId: z.string().min(1, "Select a client"),
  budget: z.number().min(0).max(10000000),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Planning", "In progress", "Review", "Completed"]),
  progress: z.number().min(0).max(100),
  due: z.iso.date(),
});
export const columns = ["Backlog", "In progress", "In review", "Done"] as const;
export const taskSchema = z.object({
  title: z.string().trim().min(3).max(100),
  projectId: z.string().min(1, "Select a project"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(columns),
  assignee: z.string().trim().min(2).max(50),
  due: z.iso.date(),
  tags: z.string().trim().max(80),
});
export type Client = z.infer<typeof clientSchema> & { id: string };
export type Project = z.infer<typeof projectSchema> & {
  id: string;
  color: string;
};
export type Task = z.infer<typeof taskSchema> & { id: string };
export const stateSchema = z.object({
  version: z.literal(1),
  clients: z.array(clientSchema.extend({ id: z.string() })),
  projects: z.array(
    projectSchema.extend({ id: z.string(), color: z.string() }),
  ),
  tasks: z.array(taskSchema.extend({ id: z.string() })),
  activity: z.array(
    z.object({ id: z.string(), text: z.string(), time: z.string() }),
  ),
});
export type State = z.infer<typeof stateSchema>;
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export const initials = (name: string) =>
  name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const dateLabel = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const revenue = [
  { month: "May", revenue: 12800, target: 15000 },
  { month: "Jun", revenue: 18200, target: 18000 },
  { month: "Jul", revenue: 16400, target: 20000 },
  { month: "Aug", revenue: 23800, target: 22000 },
  { month: "Sep", revenue: 21500, target: 24000 },
  { month: "Oct", revenue: 28600, target: 26000 },
];
export const seed: State = {
  version: 1,
  clients: [
    {
      id: "c1",
      name: "Mara Ellis",
      company: "Lumen & Co.",
      email: "mara@lumen.example",
      status: "Active",
    },
    {
      id: "c2",
      name: "Theo Park",
      company: "Orbitfield",
      email: "theo@orbitfield.example",
      status: "Active",
    },
    {
      id: "c3",
      name: "Nia Brooks",
      company: "Stillwater Studio",
      email: "nia@stillwater.example",
      status: "Active",
    },
    {
      id: "c4",
      name: "Leo Finch",
      company: "Forma Collective",
      email: "leo@forma.example",
      status: "Lead",
    },
    {
      id: "c5",
      name: "Iris Vale",
      company: "Mossline",
      email: "iris@mossline.example",
      status: "Inactive",
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Lumen brand experience",
      description:
        "A thoughtful digital home for an imaginary creative company.",
      clientId: "c1",
      budget: 18500,
      priority: "High",
      status: "In progress",
      progress: 68,
      due: "2026-11-12",
      color: "purple",
    },
    {
      id: "p2",
      name: "Orbitfield analytics",
      description: "Making a fictional product’s data clear and approachable.",
      clientId: "c2",
      budget: 24000,
      priority: "High",
      status: "Review",
      progress: 92,
      due: "2026-11-05",
      color: "blue",
    },
    {
      id: "p3",
      name: "Stillwater commerce",
      description:
        "A calm shopping concept for a fictional independent studio.",
      clientId: "c3",
      budget: 12800,
      priority: "Medium",
      status: "In progress",
      progress: 42,
      due: "2026-11-24",
      color: "green",
    },
    {
      id: "p4",
      name: "Forma design system",
      description:
        "A flexible visual language for an imaginary design collective.",
      clientId: "c4",
      budget: 9200,
      priority: "Low",
      status: "Planning",
      progress: 12,
      due: "2026-12-08",
      color: "amber",
    },
    {
      id: "p5",
      name: "Mossline discovery",
      description:
        "An exploratory strategy engagement with fictional deliverables.",
      clientId: "c5",
      budget: 6500,
      priority: "Low",
      status: "Completed",
      progress: 100,
      due: "2026-10-20",
      color: "green",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Map the onboarding journey",
      projectId: "p1",
      priority: "High",
      status: "Backlog",
      assignee: "Alex Morgan",
      due: "2026-11-03",
      tags: "Strategy, UX",
    },
    {
      id: "t2",
      title: "Explore dashboard layouts",
      projectId: "p2",
      priority: "Medium",
      status: "Backlog",
      assignee: "Nia Cole",
      due: "2026-11-04",
      tags: "Design",
    },
    {
      id: "t3",
      title: "Build the component library",
      projectId: "p1",
      priority: "High",
      status: "In progress",
      assignee: "Alex Morgan",
      due: "2026-11-06",
      tags: "Development, UI",
    },
    {
      id: "t4",
      title: "Design product detail pages",
      projectId: "p3",
      priority: "Medium",
      status: "In progress",
      assignee: "Sam Rivera",
      due: "2026-11-08",
      tags: "Design, Commerce",
    },
    {
      id: "t5",
      title: "Review chart accessibility",
      projectId: "p2",
      priority: "High",
      status: "In review",
      assignee: "Nia Cole",
      due: "2026-11-02",
      tags: "Accessibility",
    },
    {
      id: "t6",
      title: "Document visual foundations",
      projectId: "p4",
      priority: "Low",
      status: "Done",
      assignee: "Alex Morgan",
      due: "2026-10-29",
      tags: "Documentation",
    },
    {
      id: "t7",
      title: "Share discovery summary",
      projectId: "p5",
      priority: "Low",
      status: "Done",
      assignee: "Sam Rivera",
      due: "2026-10-20",
      tags: "Strategy",
    },
  ],
  activity: [
    {
      id: "a1",
      text: "Orbitfield analytics moved to Review",
      time: "2026-10-30T14:30:00Z",
    },
    {
      id: "a2",
      text: "Nia Brooks joined the client workspace",
      time: "2026-10-30T12:15:00Z",
    },
    {
      id: "a3",
      text: "Visual foundations task completed",
      time: "2026-10-29T19:00:00Z",
    },
    {
      id: "a4",
      text: "Lumen brand experience reached 68%",
      time: "2026-10-29T15:00:00Z",
    },
  ],
};
