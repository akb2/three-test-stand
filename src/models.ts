import { Light, Mesh, Vector3 } from "three";

export type ObjectType = Mesh | Light;

export interface StorybookFactoryParams {
  controlTarget?: Vector3;
  cameraPosition?: Vector3;
  objects: ObjectType | ObjectType[];
}