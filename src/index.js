import init, { hello } from "mons-web";

async function run() {
  await init();
  console.log(hello());
}

run();

const overlay = document.getElementById("overlay");
const images = {};

for (let y = 0; y < 11; y++) {
  for (let x = 0; x < 11; x++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
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
}

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
  if (images[key]) {
    images[key].remove();
    delete images[key];
  } else {
    placeItem(drainer, x, y);
  }
}
