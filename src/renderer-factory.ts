import { RefObject } from "preact";
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { onElementDefined } from "./helpers";

export const rendererFactory = (
  hostRef: RefObject<HTMLDivElement>,
  scene: Scene,
  controlTarget: Vector3,
  cameraPosition: Vector3
): WebGLRenderer => {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  const control = new OrbitControls(camera, renderer.domElement);

  const onResize = () => {
    const { width, height } = hostRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 };
    const ratio = window.devicePixelRatio ?? 1;

    renderer.setSize(width / ratio, height / ratio, false);
    renderer.setPixelRatio(ratio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  control.target.set(controlTarget.x, controlTarget.y, controlTarget.z);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.far = 900;

  onElementDefined(hostRef, host => {
    const renderLoop = () => {
      requestAnimationFrame(renderLoop);
      control.update();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(onResize);

    host.appendChild(renderer.domElement);
    host.style.width = "calc(100svw - 2rem)";
    host.style.height = "calc(100svh - 2rem)";

    resizeObserver.observe(host);
    renderLoop();

    return () => {
      hostRef.current?.removeChild(renderer.domElement);
      resizeObserver.disconnect();
      control.dispose();
    };
  });

  onResize();

  return renderer;
};