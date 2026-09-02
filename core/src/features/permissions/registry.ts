import camera from "./camera";
import gallery from "./gallery";
import notifications from "./notifications";

async function refresh() {
  const [cameraResponse, galleryResponse, notificationsResponse] =
    await Promise.all([
      camera.refresh(),
      gallery.refresh(),
      notifications.refresh(),
    ]);

  return {
    camera: cameraResponse,
    gallery: galleryResponse,
    notifications: notificationsResponse,
  };
}

/** Every permission requested by the app, exposed through one API. */
const permissions = {
  camera,
  gallery,
  notifications,
  refresh,
};

export default permissions;
