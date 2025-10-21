import { RefObject } from "preact";
import { useLayoutEffect } from "preact/hooks";
import { Material, Mesh } from "three";
import { ObjectType } from "./models";

export const isMesh = (object: unknown): object is Mesh => object instanceof Mesh && object.type === "Mesh";

export const materialDispose = (materials: Material | Material[]): void => Array.isArray(materials)
  ? materials.forEach(material => material.dispose())
  : materials.dispose();

export const meshDispose = (mesh: ObjectType): void => {
  if (isMesh(mesh)) {
    mesh.geometry.dispose();
    materialDispose(mesh.material);
  } else {
    mesh.dispose();
  }
};

export const onElementDefined = <E extends HTMLElement = HTMLElement>(ref: RefObject<E>, callback: (element: E) => void) => useLayoutEffect(() => {
  const element = ref.current;

  if (element) {
    return callback(element);
  }
});