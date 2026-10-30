import type { Metadata } from "next";
import "./globals.css";
import { Workspace } from "@/components/workspace";
export const metadata: Metadata = {
  title: { default: "FlowBoard · Portfolio demo", template: "%s · FlowBoard" },
  description:
    "An original personal portfolio project. Explore a fictional business workspace with clients, projects, tasks and reports. All data is fictional.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Workspace>{children}</Workspace>
      </body>
    </html>
  );
}
