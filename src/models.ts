import { Args } from "@storybook/preact";
import { Light, Mesh, Scene, Vector3, WebGLRenderer } from "three";

export type ObjectType = Mesh | Light;

interface StorybookFactoryRenderParams {
  args: Args;
  scene: Scene;
  renderer: WebGLRenderer;
}

export interface StorybookFactoryParams {
  controlTarget?: Vector3;
  cameraPosition?: Vector3;
  objects: ObjectType | ObjectType[];
  renderFunc?: (params: StorybookFactoryRenderParams) => void;
}