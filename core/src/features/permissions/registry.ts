import camera from "./camera";
import gallery from "./gallery";

async function refresh() {
  const [cameraResponse, galleryResponse] = await Promise.all([
    camera.refresh(),
    gallery.refresh(),
  ]);

  return {
    camera: cameraResponse,
    gallery: galleryResponse,
  };
}

/** Every permission requested by the app, exposed through one API. */
const permissions = {
  camera,
  gallery,
  refresh,
};

export default permissions;
