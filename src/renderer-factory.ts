import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export const rendererFactory = (
  host: HTMLDivElement,
  scene: Scene,
  controlTarget: Vector3,
  cameraPosition: Vector3
): [WebGLRenderer, () => void] => {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  const control = new OrbitControls(camera, renderer.domElement);

  const renderLoop = () => {
    requestAnimationFrame(renderLoop);
    control.update();
    renderer.render(scene, camera);
  };

  const onResize = () => {
    const { width, height } = host.getBoundingClientRect();
    const ratio = window.devicePixelRatio ?? 1;

    renderer.setSize(width / ratio, height / ratio, false);
    renderer.setPixelRatio(ratio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(onResize);

  control.target.set(controlTarget.x, controlTarget.y, controlTarget.z);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.far = 900;

  renderLoop();

  return [
    renderer,
    () => {
      resizeObserver.disconnect();
      control.dispose();
    }
  ];
};