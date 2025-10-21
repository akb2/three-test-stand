import { useLayoutEffect } from "preact/hooks";
import { AmbientLight, Color, DirectionalLight, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from "three";
import { meshDispose } from "./helpers";
import { ObjectType } from "./models";

export const sceneFactory = (
  background: Color,
  ...objects: ObjectType[]
): Scene => {
  const scene = new Scene();
  const lightA = new DirectionalLight(0xffffff, 3);
  const lightB = new AmbientLight(0xffffff, 1);
  const geometry = new PlaneGeometry(30, 30, 1, 1);
  const material = new MeshBasicMaterial({ color: 0x999999 });
  const mesh = new Mesh(geometry, material);

  useLayoutEffect(() => {
    lightA.position.set(0, 10, 1).normalize();
    mesh.position.set(0, 0, 0);
    mesh.rotateX(-Math.PI / 2);
    scene.background = background;
    scene.add(lightA, lightB, mesh, ...objects);

    return () => {
      meshDispose(mesh);
      meshDispose(lightA);
      meshDispose(lightB);
    };
  });

  return scene;
};