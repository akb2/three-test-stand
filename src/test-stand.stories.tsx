import { Meta, StoryObj } from "@storybook/preact";
import "preact";
import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import { storybookFactory } from "./storybook-factory";

const meta: Meta = {
  title: "Three/TreeGeometry",
  tags: ["autodocs"],
}

export default meta;

export const Default: StoryObj = storybookFactory({
  objects: new Mesh(
    new BoxGeometry(3, 3, 3),
    new MeshStandardMaterial({ color: 0x00ff00 })
  ),
});