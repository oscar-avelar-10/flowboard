import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
test("workspace CRUD, validation, cross-page metrics, persistence and safe deletion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/clients");
  await expect(
    page.getByRole("heading", { name: "Your clients" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add client", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Create client", exact: true })
    .click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await page.getByLabel("Contact name").fill("Eden Test");
  await page.getByLabel("Company", { exact: true }).fill("Fable Test Studio");
  await page.getByLabel("Email address").fill("eden@fable.example");
  await page.getByLabel("Status", { exact: true }).selectOption("Active");
  await page
    .getByRole("button", { name: "Create client", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Fable Test Studio", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Fable Test Studio", exact: true }),
  ).toBeVisible();
  await page.goto("/projects");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page.getByLabel("Project name").fill("Fable Test Launch");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A fictional project created in the browser verification flow.");
  await page
    .getByLabel("Client", { exact: true })
    .selectOption({ label: "Fable Test Studio" });
  await page.getByLabel("Budget (USD)").fill("35000");
  await page.getByLabel("Progress (%)").fill("25");
  await page.getByLabel("Due date").fill("2026-12-20");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Fable Test Launch", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Fable Test Studio", exact: true }),
  ).toBeVisible();
  await page.goto("/board");
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Task title").fill("Review Fable Test Launch");
  await page
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "Fable Test Launch" });
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Review Fable Test Launch" }),
  ).toBeVisible();
  await page
    .getByLabel("Move Review Fable Test Launch", { exact: true })
    .selectOption("Done");
  await expect(
    page
      .getByRole("region", { name: "Done column" })
      .getByRole("heading", { name: "Review Fable Test Launch" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Done column" })
      .getByRole("heading", { name: "Review Fable Test Launch" }),
  ).toBeVisible();
  await page.goto("/reports");
  await expect(
    page.getByText("Fable Test Studio", { exact: true }),
  ).toBeVisible();
  await page.goto("/clients");
  await page
    .getByRole("button", { name: "Delete Fable Test Studio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Delete client", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByRole("button", { name: "Add client", exact: true })
    .first()
    .click();
  await page.getByLabel("Contact name").fill("Orin Vale");
  await page.getByLabel("Company", { exact: true }).fill("Temporary Fiction");
  await page.getByLabel("Email address").fill("orin@fiction.example");
  await page
    .getByRole("button", { name: "Create client", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete Temporary Fiction", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete client", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Temporary Fiction", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Search clients").fill("no such company");
  await expect(
    page.getByRole("heading", { name: "No clients found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .last()
    .click();
  await page.getByLabel("Search clients").clear();
  await expect(
    page.getByRole("cell", { name: "Fable Test Studio", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("pointer drag moves a card and persists its new column", async ({
  page,
}) => {
  await page.goto("/board");
  const grip = page.getByRole("button", {
    name: "Drag Map the onboarding journey",
    exact: true,
  });
  const target = page.getByRole("region", {
    name: "In review column",
    exact: true,
  });
  const a = await grip.boundingBox();
  const b = await target.boundingBox();
  if (!a || !b) throw Error("Missing drag target");
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + 15, a.y + 15, { steps: 5 });
  await page.mouse.move(b.x + b.width / 2, b.y + 70, { steps: 20 });
  await page.mouse.up();
  await expect(
    target.getByRole("heading", {
      name: "Map the onboarding journey",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    target.getByRole("heading", {
      name: "Map the onboarding journey",
      exact: true,
    }),
  ).toBeVisible();
});
test("mobile and tablet routes fit the viewport and navigation works", async ({
  page,
}) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/", "/clients", "/projects", "/board", "/reports"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
    }
    if (width === 390) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Clients", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Your clients" }),
      ).toBeVisible();
    }
  }
});
test("invalid storage recovers with an explicit warning", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("flowboard.workspace.v1", '{"version":0}'),
  );
  await page.reload();
  await expect(page.locator(".storage-warning")).toContainText(
    "Saved data could not be read",
  );
  await expect(
    page.getByRole("heading", { name: "Good morning, Alex" }),
  ).toBeVisible();
});

test("essential WCAG accessibility checks across all pages", async ({
  page,
}) => {
  for (const route of ["/", "/clients", "/projects", "/board", "/reports"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const violations = result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    }));
    expect(violations, route).toEqual([]);
  }
});

test("charts draw real series and expose interactive details", async ({
  page,
}) => {
  await page.goto("/");
  const area = page.locator(".recharts-area-area");
  await expect(area).toBeVisible();
  await expect(area).toHaveAttribute("d", /[LC]/);
  await page.getByLabel("Revenue period").selectOption("3");
  await expect(page.getByText("$73,900", { exact: true })).toBeVisible();
  await page.goto("/reports");
  await expect(page.locator(".recharts-bar-rectangle").first()).toBeVisible();
  await expect(page.locator(".recharts-pie-sector").first()).toBeVisible();
  await page.locator(".recharts-bar-rectangle").first().hover();
  await expect(page.locator(".recharts-tooltip-wrapper").first()).toBeVisible();
});
