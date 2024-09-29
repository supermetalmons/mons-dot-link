export const ns = "http://www.w3.org/2000/svg";

export function setFrame(element: SVGElement, x: number, y: number, width: number, height: number): void {
  setFrameStr(element, x.toString(), y.toString(), width.toString(), height.toString());
}

export function offsetX(element: SVGElement, delta: number): void {
  element.setAttribute("x", (parseFloat(element.getAttribute("x") || "0") + delta).toString());
}

export function setOrigin(element: SVGElement, x: number, y: number): void {
  setOriginStr(element, x.toString(), y.toString());
}

export function setSize(element: SVGElement, width: number, height: number): void {
  setSizeStr(element, width.toString(), height.toString());
}

export function setFrameStr(element: SVGElement, x: string, y: string, width: string, height: string): void {
  setOriginStr(element, x, y);
  setSizeStr(element, width, height);
}

export function setSizeStr(element: SVGElement, width: string, height: string): void {
  element.setAttribute("width", width);
  element.setAttribute("height", height);
}

export function setOriginStr(element: SVGElement, x: string, y: string): void {
  element.setAttribute("x", x);
  element.setAttribute("y", y);
}

export function circle(centerX: number, centerY: number, radius: number): SVGElement {
  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", centerX.toString());
  circle.setAttribute("cy", centerY.toString());
  circle.setAttribute("r", radius.toString());
  return circle;
}

export function setOpacity(element: SVGElement, opacity: number) {
  element.setAttribute("opacity", opacity.toString());
}

export function setFill(element: SVGElement, fill: string = "white") {
  element.setAttribute("fill", fill);
}

export function setImage(element: SVGElement, data: string) {
  element.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${data}`);
}

export function setHidden(element: SVGElement, isHidden: boolean) {
  element.setAttribute("display", isHidden ? "none" : "");
}
