export const ns = "http://www.w3.org/2000/svg";

export function setupFrame(element: SVGElement, x: number, y: number, width: number, height: number): void {
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
    element.setAttribute("width", width.toString());
    element.setAttribute("height", height.toString());
  }
  
  export function setupOrigin(element: SVGElement, x: number, y: number): void {
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
  }

  export function setImage(element: SVGElement, data: string) {
    element.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${data}`);
  }

  export function setHidden(element: SVGElement, isHidden: boolean) {
    element.setAttribute("display", isHidden ? "none" : "");
  }