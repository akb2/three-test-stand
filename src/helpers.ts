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