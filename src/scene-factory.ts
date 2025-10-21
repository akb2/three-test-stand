import { AmbientLight, Color, DirectionalLight, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from "three";
import { meshDispose } from "./helpers";
import { ObjectType } from "./models";

export const sceneFactory = (
  background: Color,
  ...objects: ObjectType[]
): [Scene, () => void] => {
  const scene = new Scene();
  const lightA = new DirectionalLight(0xffffff, 3);
  const lightB = new AmbientLight(0xffffff, 1);
  const geometry = new PlaneGeometry(1000, 1000);
  const material = new MeshBasicMaterial({ color: 0xbbbbbb });
  const mesh = new Mesh(geometry, material);

  scene.background = background;

  lightA.position.set(0, 10, 1).normalize();
  scene.add(lightA, lightB, mesh, ...objects);

  return [
    scene,
    () => {
      meshDispose(mesh);
      meshDispose(lightA);
      meshDispose(lightB);
    },
  ];
};