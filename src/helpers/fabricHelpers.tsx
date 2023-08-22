import { fabric } from "fabric";

export const RectangleRef = () => {
  return new fabric.Rect({
    top: 50,
    left: 50,
    width: 50,
    height: 50,
    fill: "red",
  });
};

export const CircleRef = () => {
  return new fabric.Circle({
    top: 50,
    left: 50,
    radius: 25,
    fill: "green",
  });
};

export const TextBoxRef = () => {
  return new fabric.Textbox('Enter Your Text Here', {
    top: 50,
    left: 50,
    width: 200,
    fontSize: 16
  });
};

export const ImageRef = (data, options) => {
  return new fabric.Image(data, options);
};
