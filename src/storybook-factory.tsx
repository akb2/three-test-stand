import { anyToArray } from "@akb2/types-tools";
import { StoryObj } from "@storybook/preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { Color, Vector3 } from "three";
import { meshDispose } from "./helpers";
import { StorybookFactoryParams } from "./models";
import { rendererFactory } from './renderer-factory';
import { sceneFactory } from "./scene-factory";

export const storybookFactory = ({
  controlTarget = new Vector3(),
  cameraPosition = new Vector3(),
  objects: mixedObjects
}: StorybookFactoryParams): StoryObj => ({
  render: args => {
    const hostRef = useRef<HTMLDivElement>(null);
    const objects = anyToArray(mixedObjects);

    useLayoutEffect(() => {
      const host = hostRef.current;

      if (!host) {
        return;
      }

      const [scene, sceneDestroy] = sceneFactory(new Color(0xffffff), ...objects);
      const [renderer, rendererDestroy] = rendererFactory(host, scene, controlTarget, cameraPosition);

      return () => {
        host.removeChild(renderer.domElement);
        rendererDestroy();
        sceneDestroy();
        objects.forEach(meshDispose);
        renderer.dispose();
      };
    });

    return <div ref={hostRef} />;
  }
});