import { Meta } from "@storybook/preact";
import "preact";
import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { storybookFactory } from "./storybook-factory";

const meta: Meta = {
  title: "Three/TreeGeometry",
  tags: ["autodocs"],
}

export default meta;

export const Default = storybookFactory({
  objects: new Mesh(
    new BoxGeometry(3, 3, 3),
    new MeshStandardMaterial({ color: 0x00ff00 }),
  ),
  controlTarget: new Vector3(-0.23121825634305526, 1.542498042005105, -1.4032897092386951),
  cameraPosition: new Vector3(-0.2847199368586508, 11.46770274057872, 20.033456073494772),
});