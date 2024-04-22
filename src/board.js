const overlay = document.getElementById("overlay");
const images = {};

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

const attackTargetColor = "#941651";
const destinationColor = "#008200";
const spiritTargetColor = "#FF84FF";
const startFromSuggestionColor = "#FEFB00";

const trace1Color = "#FF2F92";
const trace2Color = "#FFD478";
const trace3Color = "#FFFB78";
const trace4Color = "#72FA78";
const trace5Color = "#73FDFF";
const trace6Color = "#75D5FF";
const trace7Color = "#D783FF";

export function setupBoard() {
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", 1);
      rect.setAttribute("height", 1);
      rect.setAttribute("fill", "rgba(255, 255, 255, 0)");
      rect.addEventListener("click", function () {
        toggleItem(x, y);
      });
      overlay.appendChild(rect);
    }

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
  }
}

function loadImage(name) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    `../img/${name}.png`
  );
  image.setAttribute("width", 1);
  image.setAttribute("height", 1);
  image.setAttribute("class", "item");
  return image;
}

function placeItem(item, x, y) {
  const img = item.cloneNode();
  img.setAttribute("x", x);
  img.setAttribute("y", y);
  overlay.appendChild(img);
  const key = `item-${x}-${y}`;
  images[key] = img;
}

function toggleItem(x, y) {
  const key = `item-${x}-${y}`;
  const img = images[key];
  if (img) {
    const overlay = document.getElementById("overlay");
    const existingHighlight = overlay.querySelector(`.highlight-${x}-${y}`);

    if (existingHighlight) {
      existingHighlight.remove();
    } else {
      const highlight = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      highlight.setAttribute("class", `highlight-${x}-${y}`);
      highlight.style.pointerEvents = "none";

      const circleRadius = 0.56;
      const circleCenter = { x: x + 0.5, y: y + 0.5 };

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", circleCenter.x);
      circle.setAttribute("cy", circleCenter.y);
      circle.setAttribute("r", circleRadius);
      circle.setAttribute("fill", "#00F900");

      const mask = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "mask"
      );
      mask.setAttribute("id", `highlight-mask-${x}-${y}`);
      const maskRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      maskRect.setAttribute("x", x);
      maskRect.setAttribute("y", y);
      maskRect.setAttribute("width", 1);
      maskRect.setAttribute("height", 1);
      maskRect.setAttribute("fill", "white");
      mask.appendChild(maskRect);
      highlight.appendChild(mask);

      circle.setAttribute("mask", `url(#highlight-mask-${x}-${y})`);
      highlight.appendChild(circle);

      img.parentNode.insertBefore(highlight, img);
    }
  } else {
    placeItem(drainer, x, y);
  }
}
