import { didClickSquare } from "./index";
import { Location } from "./models";
import { colors } from "./colors";

const overlay = document.getElementById("overlay");
const images: { [key: string]: SVGElement } = {};

const drainer = loadImage("drainer");
const angel = loadImage("angel");
const demon = loadImage("demon");
const spirit = loadImage("spirit");
const mystic = loadImage("mystic");
const mana = loadImage("mana");
const drainerB = loadImage("drainer-black");
const angelB = loadImage("angel-black");
const demonB = loadImage("demon-black");
const spiritB = loadImage("spirit-black");
const mysticB = loadImage("mystic-black");
const manaB = loadImage("mana-black");
const bombOrPotion = loadImage("bombOrPotion");
const bomb = loadImage("bomb");
const potion = loadImage("potion");
const supermana = loadImage("supermana");
const supermanaSimple = loadImage("supermana-simple");

export function setupBoard() {
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", "1");
      rect.setAttribute("height", "1");
      rect.setAttribute("fill", "rgba(255, 255, 255, 0)");
      rect.addEventListener("click", function () {
        toggleItem(x, y);
      });
      overlay.appendChild(rect);
    }
  }
}

// TODO: deprecate
export function addDemoMons() {
  placeItem(demon, 3, 10);
  placeItem(angel, 4, 10);
  placeItem(drainer, 5, 10);
  placeItem(spirit, 6, 10);
  placeItem(mystic, 7, 10);

  placeItem(demonB, 7, 0);
  placeItem(angelB, 6, 0);
  placeItem(drainerB, 5, 0);
  placeItem(spiritB, 4, 0);
  placeItem(mysticB, 3, 0);

  placeItem(manaB, 4, 3);
  placeItem(manaB, 6, 3);
  placeItem(manaB, 3, 4);
  placeItem(manaB, 5, 4);
  placeItem(manaB, 7, 4);

  placeItem(mana, 3, 6);
  placeItem(mana, 4, 7);
  placeItem(mana, 5, 6);
  placeItem(mana, 6, 7);
  placeItem(mana, 7, 6);

  placeItem(bombOrPotion, 0, 5);
  placeItem(bombOrPotion, 10, 5);
  placeItem(supermana, 5, 5);

  // setBase(demon, 3, 9);
  // setBase(mysticB, 3, 1);
  // placeMonWithMana(drainer, mana, 2, 3);
  // placeMonWithSupermana(drainer, 2, 3);
  // placeMonWithBomb(drainer, 2, 3);
}

export function blinkLocations(locations: Location[]) {
  locations.forEach((location) => {
    const key = `item-${location.j}-${location.i}`;
    const img = images[key];
    highlightDestinationItem(img, location.j, location.i, true, colors.startFromSuggestion);
  });
}

function loadImage(name: string) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    `../img/${name}.png`
  );
  image.setAttribute("width", "1");
  image.setAttribute("height", "1");
  image.setAttribute("class", "item");
  return image;
}

function placeMonWithBomb(item: SVGElement, x: number, y: number) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", x.toString());
  img.setAttribute("y", y.toString());

  const carriedBomb = bomb.cloneNode() as SVGElement;
  carriedBomb.setAttribute("x", (x + 0.52).toString());
  carriedBomb.setAttribute("y", (y + 0.495).toString());
  carriedBomb.setAttribute("width", (0.54).toString());
  carriedBomb.setAttribute("height", (0.54).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.appendChild(img);
  container.appendChild(carriedBomb);

  overlay.appendChild(container);
  const key = `item-${x}-${y}`;
  images[key] = container;
}

function placeMonWithSupermana(item: SVGElement, x: number, y: number) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", x.toString());
  img.setAttribute("y", y.toString());

  const carriedMana = supermanaSimple.cloneNode() as SVGElement;
  carriedMana.setAttribute("x", (x + 0.13).toString());
  carriedMana.setAttribute("y", (y - 0.13).toString());
  carriedMana.setAttribute("width", (0.74).toString());
  carriedMana.setAttribute("height", (0.74).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.appendChild(img);
  container.appendChild(carriedMana);

  overlay.appendChild(container);
  const key = `item-${x}-${y}`;
  images[key] = container;
}

function placeMonWithMana(item: SVGElement, mana: SVGElement, x: number, y: number) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", x.toString());
  img.setAttribute("y", y.toString());

  const carriedMana = mana.cloneNode() as SVGElement;
  carriedMana.setAttribute("x", (x + 0.34).toString());
  carriedMana.setAttribute("y", (y + 0.27).toString());
  carriedMana.setAttribute("width", (0.93).toString());
  carriedMana.setAttribute("height", (0.93).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.appendChild(img);
  container.appendChild(carriedMana);

  overlay.appendChild(container);
  const key = `item-${x}-${y}`;
  images[key] = container;
}

function placeItem(item: SVGElement, x: number, y: number, fainted = false) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", x.toString());
  img.setAttribute("y", y.toString());
  overlay.appendChild(img);
  const key = `item-${x}-${y}`;
  images[key] = img;
  if (fainted) {
    faint(img, x, y);
  }
}

function setBase(item: SVGElement, x: number, y: number) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("width", "0.6");
  img.setAttribute("height", "0.6");
  const adjustedX = x + 0.2;
  const adjustedY = y + 0.2;
  img.setAttribute("x", adjustedX.toString());
  img.setAttribute("y", adjustedY.toString());
  img.style.opacity = "0.4";
  overlay.appendChild(img);
}

function faint(img: SVGElement, x: number, y: number) {
  img.style.transform = "rotate(90deg)";
  img.style.transformOrigin = `${x + 0.5}px ${y + 0.5}px`;
}

function highlightEmptyDestination(x: number, y: number) {
  const highlight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  highlight.setAttribute("class", `highlight-${x}-${y}`);
  highlight.style.pointerEvents = "none";
  const circleRadius = 0.15;
  const circleCenter = { x: x + 0.5, y: y + 0.5 };
  highlight.setAttribute("cx", circleCenter.x.toString());
  highlight.setAttribute("cy", circleCenter.y.toString());
  highlight.setAttribute("r", circleRadius.toString());
  highlight.setAttribute("fill", colors.destination);
  overlay.append(highlight);
}

function highlightSelectedItem(img: SVGElement, x: number, y: number) {
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.setAttribute("class", `highlight-${x}-${y}`);
  highlight.style.pointerEvents = "none";

  const circleRadius = 0.56;
  const circleCenter = { x: x + 0.5, y: y + 0.5 };

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", circleCenter.x.toString());
  circle.setAttribute("cy", circleCenter.y.toString());
  circle.setAttribute("r", circleRadius.toString());
  circle.setAttribute("fill", "#00F900");

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `highlight-mask-${x}-${y}`);
  const maskRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  maskRect.setAttribute("x", x.toString());
  maskRect.setAttribute("y", y.toString());
  maskRect.setAttribute("width","1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${x}-${y})`);
  highlight.appendChild(circle);

  img.parentNode.insertBefore(highlight, img);
}

function highlightDestinationItem(img: SVGElement, x: number, y: number, blink = false, color: string) {
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.setAttribute("class", `highlight-${x}-${y}`);
  highlight.style.pointerEvents = "none";

  const circleRadius = 0.56;
  const circleCenter = { x: x + 0.5, y: y + 0.5 };

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x.toString());
  rect.setAttribute("y", y.toString());
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute("fill", color);

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `highlight-mask-${x}-${y}`);

  const maskRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  maskRect.setAttribute("x", x.toString());
  maskRect.setAttribute("y", y.toString());
  maskRect.setAttribute("width", "1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);

  const maskCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  maskCircle.setAttribute("cx", circleCenter.x.toString());
  maskCircle.setAttribute("cy", circleCenter.y.toString());
  maskCircle.setAttribute("r", circleRadius.toString());
  maskCircle.setAttribute("fill", "black");
  mask.appendChild(maskCircle);

  highlight.appendChild(mask);
  highlight.appendChild(rect);

  rect.setAttribute("mask", `url(#highlight-mask-${x}-${y})`);

  img.parentNode.insertBefore(highlight, img);

  if (blink) {
    setTimeout(() => {
      highlight.remove();
    }, 100);
  }
}

function drawTrace(start: number, end: number) {
  // TODO: implement
}

function toggleItem(x: number, y: number) {
  // didClickSquare({i: y, j: x});
  // return;

  const key = `item-${x}-${y}`;
  const img = images[key];
  if (img) {
    const existingHighlight = overlay.querySelector(`.highlight-${x}-${y}`);
    if (existingHighlight) {
      existingHighlight.remove();
    } else {
      highlightSelectedItem(img, x, y);
    }
  } else {
    const existingHighlight = overlay.querySelector(`.highlight-${x}-${y}`);
    if (existingHighlight) {
      existingHighlight.remove();
    } else {
      highlightEmptyDestination(x, y);
    }
  }
}
