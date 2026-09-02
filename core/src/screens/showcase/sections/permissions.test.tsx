import { PermissionStatus } from "expo";

import { permissions } from "@/features/permissions";
import { fireEvent, render, screen, waitFor } from "@/root/testing";

import Component from "./permissions";

const granted = {
  status: PermissionStatus.GRANTED,
  granted: true,
  canAskAgain: true,
  expires: "never" as const,
};

describe(`${Component.name} smoke test`, () => {
  afterEach(() => {
    permissions.camera.reset();
    permissions.gallery.reset();
    jest.restoreAllMocks();
  });

  it("requests camera and gallery through the permissions feature", async () => {
    permissions.camera.reset();
    permissions.gallery.reset();
    jest.spyOn(permissions, "refresh").mockResolvedValue({
      camera: granted,
      gallery: { ...granted, accessPrivileges: "all" },
    });
    const cameraRequest = jest
      .spyOn(permissions.camera, "request")
      .mockResolvedValue(granted);
    const galleryRequest = jest
      .spyOn(permissions.gallery, "request")
      .mockResolvedValue({ ...granted, accessPrivileges: "all" });

    await render(<Component />);

    const requestButtons = screen.getAllByRole("button", { name: "request" });
    await fireEvent.press(requestButtons[0]);
    await fireEvent.press(requestButtons[1]);

    await waitFor(() => {
      expect(cameraRequest).toHaveBeenCalledTimes(1);
      expect(galleryRequest).toHaveBeenCalledTimes(1);
    });
  });

  it("can refresh every permission through the registry", async () => {
    const refresh = jest.spyOn(permissions, "refresh").mockResolvedValue({
      camera: granted,
      gallery: { ...granted, accessPrivileges: "all" },
    });

    await render(<Component />);
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole("button", { name: "refresh all" }));

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
  });

  it("shows canAskAgain as false after permission is granted", async () => {
    const completed = { ...granted, canAskAgain: false };
    jest.spyOn(permissions.camera, "useValue").mockReturnValue(completed);
    jest.spyOn(permissions.gallery, "useValue").mockReturnValue({
      ...completed,
      accessPrivileges: "all",
    });
    jest.spyOn(permissions, "refresh").mockResolvedValue({
      camera: completed,
      gallery: { ...completed, accessPrivileges: "all" },
    });

    await render(<Component />);

    expect(screen.getAllByText("false")).toHaveLength(2);
  });
});
