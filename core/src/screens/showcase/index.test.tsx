import env from "@/constants/env";
import { render, screen } from "@/root/testing";

import Component from "./index";

const SECTION_TITLES = [
  "Typography",
  "Theme & colors",
  "Localization",
  "Accessibility",
  "Responsive units",
  "Grid",
  "Spacer",
  "Icons",
  "Buttons",
  "Header",
  "Tab bar",
  "Checkboxes",
  "Radio buttons",
  "Switches",
  "Sliders",
  "Progress",
  "Segmented control",
  "State views",
  "Inputs",
  "Images",
  "Cards",
  "Carousel",
  "Image picker",
  "Modals",
  "Popups",
  "Toasts",
  "Permissions",
  "Deep links",
  "Storage",
  "Logger",
  "Utilities",
];

describe(`${Component.name} smoke test`, () => {
  it("renders the app name as the screen's top-level heading", async () => {
    await render(<Component />);

    // Queried as "heading", not "header": Text sets both spellings, and RN
    // resolves the W3C `role` ahead of `accessibilityRole`, so that's the
    // one that surfaces. Both reach their platform — see headingA11yProps.
    const heading = screen.getByRole("heading");

    expect(heading.props.children).toBe(env.appName);
    expect(heading.props["aria-level"]).toBe(1);
  });

  /**
   * The showcase's whole job is that every section is reachable, so this
   * asserts the full set rather than a sample — a section wired up with a
   * translation key that doesn't resolve fails here rather than being
   * noticed by eye later.
   */
  it("renders every showcase section's title", async () => {
    await render(<Component />);

    for (const title of SECTION_TITLES) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it("gives every section a collapsed, expandable header", async () => {
    await render(<Component />);

    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(
      SECTION_TITLES.length,
    );
  });
});
