/**
 * Generates the boutique's illustrated catalogue art as optimised SVGs.
 *
 * Every product image ships in-repo as a tiny vector so the storefront looks
 * finished with no external image dependency, no layout shift and no CDN
 * round-trips. Re-run with: node scripts/generate-product-art.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "products");
const collectionDir = join(root, "public", "collections");

const W = 800;
const H = 1000;

/** Soft paper backgrounds that keep the grid feeling light and airy. */
const PAPERS = {
  blush: ["#FEF7F7", "#F6DADA"],
  cream: ["#FFFCF8", "#F7E6DA"],
  rose: ["#FDF5F3", "#EFC7C0"],
  gold: ["#FFFBF2", "#F0E2C4"],
  plum: ["#F7F1F2", "#E4CDD2"],
};

const GOLD = ["#F3DFBB", "#D9B173", "#A9834A"];

function defs({ paper, tone, id }) {
  const [p0, p1] = PAPERS[paper];
  return `
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${p0}"/>
      <stop offset="1" stop-color="${p1}"/>
    </linearGradient>
    <radialGradient id="halo-${id}" cx="0.5" cy="0.36" r="0.62">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.92"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD[0]}"/>
      <stop offset="0.46" stop-color="${GOLD[1]}"/>
      <stop offset="1" stop-color="${GOLD[2]}"/>
    </linearGradient>
    <linearGradient id="body-${id}" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.4" stop-color="#FDF7F4"/>
      <stop offset="1" stop-color="#EBD9D3"/>
    </linearGradient>
    <linearGradient id="tone-${id}" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${tone[0]}"/>
      <stop offset="1" stop-color="${tone[1]}"/>
    </linearGradient>
    <linearGradient id="toneDeep-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tone[1]}"/>
      <stop offset="1" stop-color="${tone[2]}"/>
    </linearGradient>
    <radialGradient id="floor-${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5D464E" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#5D464E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gloss-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

function backdrop(id) {
  return `
  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  <circle cx="400" cy="360" r="350" fill="url(#halo-${id})"/>
  <path d="M-40 690 C 180 600, 250 820, 430 780 C 620 738, 700 900, 860 830 L 860 1010 L -40 1010 Z"
        fill="#FFFFFF" fill-opacity="0.42"/>
  <ellipse cx="400" cy="818" rx="215" ry="42" fill="url(#floor-${id})"/>`;
}

function petals(id) {
  return `
  <g fill="url(#tone-${id})" opacity="0.5">
    <path d="M164 268 c 26 -30 66 -22 70 12 c 3 30 -30 52 -58 40 c -19 -8 -24 -34 -12 -52 z"/>
    <path d="M636 322 c 22 -26 58 -18 60 12 c 2 26 -27 45 -51 34 c -16 -7 -19 -30 -9 -46 z"/>
    <path d="M214 604 c 18 -22 49 -15 51 10 c 2 22 -23 38 -43 29 c -14 -6 -17 -25 -8 -39 z"/>
    <path d="M648 640 c 16 -20 44 -13 45 9 c 2 20 -20 34 -38 26 c -13 -6 -15 -23 -7 -35 z"/>
  </g>`;
}

function gloss(id, x, y, w, h, rx) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#gloss-${id})" opacity="0.65"/>`;
}

function monogram(id, cy, scale = 1) {
  return `
  <g transform="translate(400 ${cy}) scale(${scale})" opacity="0.9">
    <text x="0" y="0" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
          font-size="34" letter-spacing="6" fill="url(#gold-${id})">VE</text>
  </g>`;
}

/* -------------------------------------------------------------------------- */
/* Silhouettes                                                                */
/* -------------------------------------------------------------------------- */

function lipstick({ id }) {
  return `
  <g>
    <rect x="338" y="566" width="124" height="252" rx="24" fill="url(#gold-${id})"/>
    <rect x="346" y="596" width="108" height="222" rx="18" fill="#FFFFFF" fill-opacity="0.16"/>
    <rect x="352" y="486" width="96" height="92" rx="10" fill="url(#body-${id})"/>
    <rect x="352" y="486" width="96" height="14" rx="6" fill="url(#gold-${id})" opacity="0.85"/>
    <path d="M356 500 L444 500 L444 372 C 444 322 402 296 400 296 C 398 296 356 322 356 372 Z"
          fill="url(#toneDeep-${id})"/>
    <path d="M372 498 L404 498 L404 340 C 404 318 396 308 388 302 Z"
          fill="#FFFFFF" fill-opacity="0.22"/>
    <rect x="352" y="700" width="96" height="3" rx="2" fill="#FFFFFF" fill-opacity="0.4"/>
  </g>`;
}

function palette({ id, tone }) {
  const SHADES = [
    "#FBE9E8", "#F0C2C4", "#E5A3A8", "#D7848C",
    "#C67A6D", "#B76E79", "#96525D", "#653740",
    "#F3DFBB", "#E3CD9C", "#D9B173", "#AD8C45",
  ];
  const SIZE = 84;
  const GAP_X = 12;
  const COLS = 4;
  const startX = 214;
  const startY = 424;
  const pan = (col, row) =>
    `<rect x="${startX + col * (SIZE + GAP_X)}" y="${startY + row * (SIZE + 18)}" width="${SIZE}" height="${SIZE}" rx="20"/>`;
  const fill = (col, row) => SHADES[row * COLS + col];
  const accents = [tone[0], tone[1], tone[2]];

  return `
  <g>
    <rect x="166" y="386" width="468" height="392" rx="44" fill="url(#body-${id})"/>
    <rect x="166" y="386" width="468" height="392" rx="44" fill="none" stroke="url(#gold-${id})" stroke-width="6"/>
    <rect x="192" y="412" width="416" height="300" rx="26" fill="#FFFFFF" fill-opacity="0.5"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      .map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const shade = accents[i % accents.length] ?? fill(col, row);
        const chosen = i % 3 === 2 ? shade : fill(col, row);
        return `${pan(col, row).replace("/>", `fill="${chosen}"/>`)}\n    ${pan(col, row).replace(
          "/>",
          'fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="2"/>',
        )}`;
      })
      .join("\n    ")}
    <rect x="250" y="726" width="300" height="36" rx="18" fill="url(#gold-${id})"/>
    <text x="400" y="752" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
          font-size="28" letter-spacing="6" fill="#FFFFFF" fill-opacity="0.92">VE</text>
  </g>`;
}

function flacon({ id }) {
  return `
  <g>
    <rect x="356" y="414" width="88" height="60" rx="8" fill="url(#gold-${id})"/>
    <rect x="372" y="292" width="56" height="130" rx="10" fill="url(#gold-${id})"/>
    <rect x="372" y="292" width="20" height="130" rx="8" fill="#FFFFFF" fill-opacity="0.3"/>
    <path d="M262 500 C 262 466 292 452 400 452 C 508 452 538 466 538 500 L 538 762 C 538 796 512 812 400 812 C 288 812 262 796 262 762 Z"
          fill="url(#body-${id})"/>
    <path d="M282 560 C 282 540 300 528 400 528 C 500 528 518 540 518 560 L 518 742 C 518 764 496 776 400 776 C 304 776 282 764 282 742 Z"
          fill="url(#tone-${id})" opacity="0.92"/>
    <path d="M262 500 C 262 466 292 452 400 452 C 508 452 538 466 538 500 L 538 762 C 538 796 512 812 400 812 C 288 812 262 796 262 762 Z"
          fill="none" stroke="url(#gold-${id})" stroke-width="5"/>
    ${gloss(id, 296, 486, 34, 250, 17)}
    <rect x="314" y="596" width="172" height="112" rx="12" fill="#FFFFFF" fill-opacity="0.72"/>
    <rect x="314" y="596" width="172" height="112" rx="12" fill="none" stroke="url(#gold-${id})" stroke-width="3"/>
    ${monogram(id, 662, 1.05)}
  </g>`;
}

function dropper({ id }) {
  return `
  <g>
    <rect x="374" y="452" width="52" height="72" rx="8" fill="url(#body-${id})"/>
    <rect x="348" y="312" width="104" height="146" rx="22" fill="url(#gold-${id})"/>
    <rect x="362" y="326" width="24" height="118" rx="12" fill="#FFFFFF" fill-opacity="0.28"/>
    <path d="M292 556 C 292 528 322 512 400 512 C 478 512 508 528 508 556 L 508 776 C 508 800 484 812 400 812 C 316 812 292 800 292 776 Z"
          fill="url(#body-${id})"/>
    <path d="M306 620 C 306 600 324 588 400 588 C 476 588 494 600 494 620 L 494 766 C 494 782 476 790 400 790 C 324 790 306 782 306 766 Z"
          fill="url(#tone-${id})" opacity="0.85"/>
    <path d="M292 556 C 292 528 322 512 400 512 C 478 512 508 528 508 556 L 508 776 C 508 800 484 812 400 812 C 316 812 292 800 292 776 Z"
          fill="none" stroke="url(#gold-${id})" stroke-width="4"/>
    ${gloss(id, 322, 552, 28, 218, 14)}
    <rect x="340" y="642" width="120" height="86" rx="10" fill="#FFFFFF" fill-opacity="0.75"/>
    ${monogram(id, 696, 0.85)}
  </g>`;
}

function jar({ id }) {
  return `
  <g>
    <rect x="256" y="558" width="288" height="234" rx="40" fill="url(#body-${id})"/>
    <rect x="256" y="558" width="288" height="234" rx="40" fill="none" stroke="url(#gold-${id})" stroke-width="4"/>
    <path d="M256 690 L544 690 L544 752 C544 776 516 792 400 792 C284 792 256 776 256 752 Z"
          fill="url(#tone-${id})" opacity="0.5"/>
    <rect x="242" y="456" width="316" height="122" rx="34" fill="url(#gold-${id})"/>
    <rect x="256" y="470" width="288" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.26"/>
    <ellipse cx="400" cy="456" rx="158" ry="26" fill="url(#gold-${id})"/>
    <ellipse cx="400" cy="456" rx="158" ry="26" fill="#FFFFFF" fill-opacity="0.14"/>
    ${monogram(id, 730, 0.9)}
  </g>`;
}

function mist({ id }) {
  return `
  <g>
    <rect x="352" y="288" width="96" height="118" rx="14" fill="url(#gold-${id})"/>
    <rect x="368" y="300" width="22" height="94" rx="11" fill="#FFFFFF" fill-opacity="0.3"/>
    <rect x="318" y="404" width="164" height="46" rx="14" fill="url(#body-${id})"/>
    <path d="M312 452 C 312 440 340 434 400 434 C 460 434 488 440 488 452 L 488 782 C 488 800 464 812 400 812 C 336 812 312 800 312 782 Z"
          fill="url(#body-${id})"/>
    <path d="M326 540 C 326 526 344 518 400 518 C 456 518 474 526 474 540 L 474 772 C 474 786 456 794 400 794 C 344 794 326 786 326 772 Z"
          fill="url(#tone-${id})" opacity="0.8"/>
    <path d="M312 452 C 312 440 340 434 400 434 C 460 434 488 440 488 452 L 488 782 C 488 800 464 812 400 812 C 336 812 312 800 312 782 Z"
          fill="none" stroke="url(#gold-${id})" stroke-width="4"/>
    ${gloss(id, 336, 470, 26, 270, 13)}
    <rect x="348" y="576" width="104" height="132" rx="10" fill="#FFFFFF" fill-opacity="0.72"/>
    ${monogram(id, 664, 0.9)}
  </g>`;
}

function powder({ id }) {
  return `
  <g>
    <circle cx="400" cy="640" r="196" fill="url(#body-${id})"/>
    <circle cx="400" cy="640" r="196" fill="none" stroke="url(#gold-${id})" stroke-width="6"/>
    <circle cx="400" cy="640" r="164" fill="url(#tone-${id})" opacity="0.9"/>
    <circle cx="400" cy="640" r="164" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3"/>
    <path d="M400 476 A 164 164 0 0 1 564 640 L 400 640 Z" fill="#FFFFFF" fill-opacity="0.22"/>
    <g stroke="url(#gold-${id})" stroke-width="3" opacity="0.75" fill="none">
      <circle cx="400" cy="640" r="118"/>
      <circle cx="400" cy="640" r="72"/>
    </g>
    ${monogram(id, 640, 1.15)}
  </g>`;
}

const SHAPES = { lipstick, palette, flacon, dropper, jar, mist, powder };

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

const ART = [
  // lipstick
  ["lipstick-velvet-noir", "lipstick", "plum", ["#B76E79", "#7A4149", "#4A3238"]],
  ["lipstick-rose-de-maison", "lipstick", "blush", ["#E5A3A8", "#C67A6D", "#96525D"]],
  ["lipstick-nude-atelier", "lipstick", "cream", ["#E7B0A5", "#C08A78", "#8E6152"]],
  ["lipstick-rouge-velours", "lipstick", "rose", ["#D7848C", "#B13B4B", "#7A1F2B"]],
  ["lipstick-petal-milk", "lipstick", "gold", ["#F0C2C4", "#D79184", "#A9636E"]],
  // eyeshadow
  ["palette-atelier-rose", "palette", "rose", ["#E7B0A5", "#B76E79", "#653740"]],
  ["palette-nuit-bloomee", "palette", "plum", ["#7B6169", "#4A3238", "#1D1216"]],
  ["palette-petal-12", "palette", "blush", ["#F8DADA", "#E5A3A8", "#D79184"]],
  ["palette-gilt-bronze", "palette", "gold", ["#E3CD9C", "#C9A961", "#8E6152"]],
  // blush
  ["blush-powder-flush", "powder", "blush", ["#F8DADA", "#E5A3A8", "#D7848C"]],
  ["blush-cream-peony", "powder", "rose", ["#F3D1CA", "#D79184", "#B76E79"]],
  ["blush-silk-rosewood", "powder", "plum", ["#E4CDD2", "#B76E79", "#7A4149"]],
  // fragrance
  ["flacon-nuit-bloomee", "flacon", "plum", ["#C98A93", "#96525D", "#4A3238"]],
  ["flacon-rose-ambre", "flacon", "rose", ["#F3D1CA", "#D79184", "#B76E79"]],
  ["flacon-oud-velours", "flacon", "gold", ["#E3CD9C", "#AD8C45", "#6D4B2E"]],
  ["mist-fleur-dawn", "mist", "cream", ["#FFF1E8", "#F0C2C4", "#E5A3A8"]],
  ["flacon-lumiere-blanche", "flacon", "blush", ["#FEF7F7", "#F3D1CA", "#D79184"]],
  ["mist-cedre-blanc", "mist", "plum", ["#E4CDD2", "#B08F9A", "#7B6169"]],
  // skincare
  ["serum-glasshouse-glow", "dropper", "gold", ["#F3DFBB", "#E3CD9C", "#C9A961"]],
  ["serum-rosewater-dew", "dropper", "blush", ["#FBE9E8", "#F3D1CA", "#E5A3A8"]],
  ["jar-nuit-balm", "jar", "plum", ["#F7F1F2", "#E4CDD2", "#B08F9A"]],
  ["jar-peony-cream", "jar", "rose", ["#FEF7F7", "#F6DADA", "#E5A3A8"]],
  ["serum-vitamin-silk", "dropper", "cream", ["#FFF8F3", "#F7E6DA", "#D9B173"]],
  ["mist-tonic-bloom", "mist", "gold", ["#F3DFBB", "#D9B173", "#A9834A"]],
];

const COLLECTIONS = [
  ["makeup", "palette", "blush", ["#F8DADA", "#E5A3A8", "#B76E79"]],
  ["perfume", "flacon", "plum", ["#F3D1CA", "#B76E79", "#4A3238"]],
  ["skincare", "dropper", "gold", ["#F3DFBB", "#E3CD9C", "#AD8C45"]],
  ["lipstick", "lipstick", "rose", ["#E5A3A8", "#B13B4B", "#653740"]],
];

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(collectionDir, { recursive: true });

  for (const [name, shape, paper, tone] of ART) {
    const id = name;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name.replace(/-/g, " ")}">
${defs({ paper, tone, id })}
${backdrop(id)}
${petals(id)}
${SHAPES[shape]({ id, tone })}
</svg>
`;
    await writeFile(join(outDir, `${name}.svg`), svg.replace(/\n{2,}/g, "\n"), "utf8");
  }

  for (const [name, shape, paper, tone] of COLLECTIONS) {
    const id = `col-${name}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name} collection">
${defs({ paper, tone, id })}
${backdrop(id)}
${petals(id)}
${SHAPES[shape]({ id, tone })}
</svg>
`;
    await writeFile(join(collectionDir, `${name}.svg`), svg.replace(/\n{2,}/g, "\n"), "utf8");
  }

  const hero = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400" width="1200" height="1400" role="img" aria-label="Velvet Essence editorial still life">
  <defs>
    <linearGradient id="hb" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FFF6F1"/>
      <stop offset="0.55" stop-color="#FCE7E6"/>
      <stop offset="1" stop-color="#F0C2C4"/>
    </linearGradient>
    <radialGradient id="hh" cx="0.42" cy="0.3" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD[0]}"/>
      <stop offset="0.5" stop-color="${GOLD[1]}"/>
      <stop offset="1" stop-color="${GOLD[2]}"/>
    </linearGradient>
    <linearGradient id="hr" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#D7848C"/>
      <stop offset="1" stop-color="#96525D"/>
    </linearGradient>
    <linearGradient id="hw" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#EFDCD6"/>
    </linearGradient>
    <radialGradient id="hf" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5D464E" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#5D464E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1400" fill="url(#hb)"/>
  <circle cx="520" cy="430" r="470" fill="url(#hh)"/>
  <ellipse cx="600" cy="1180" rx="430" ry="66" fill="url(#hf)"/>
  <path d="M-40 980 C 260 880, 420 1120, 700 1050 C 940 990, 1080 1180, 1240 1100 L 1240 1420 L -40 1420 Z" fill="#FFFFFF" fill-opacity="0.4"/>

  <g opacity="0.55" fill="url(#hr)">
    <path d="M212 336 c 34 -40 88 -28 92 16 c 4 40 -40 68 -76 52 c -25 -11 -31 -45 -16 -68 z"/>
    <path d="M980 470 c 30 -34 78 -24 80 16 c 3 34 -36 60 -68 45 c -21 -10 -25 -40 -12 -61 z"/>
    <path d="M250 812 c 26 -30 68 -21 70 14 c 3 30 -32 52 -60 39 c -19 -9 -22 -34 -10 -53 z"/>
  </g>

  <!-- tall flacon -->
  <g>
    <rect x="606" y="392" width="96" height="70" rx="10" fill="url(#hg)"/>
    <rect x="626" y="248" width="56" height="156" rx="12" fill="url(#hg)"/>
    <path d="M516 496 C 516 460 550 444 664 444 C 778 444 812 460 812 496 L 812 812 C 812 852 782 870 664 870 C 546 870 516 852 516 812 Z" fill="url(#hw)"/>
    <path d="M540 570 C 540 546 562 532 664 532 C 766 532 788 546 788 570 L 788 790 C 788 816 762 830 664 830 C 566 830 540 816 540 790 Z" fill="url(#hr)" opacity="0.9"/>
    <path d="M516 496 C 516 460 550 444 664 444 C 778 444 812 460 812 496 L 812 812 C 812 852 782 870 664 870 C 546 870 516 852 516 812 Z" fill="none" stroke="url(#hg)" stroke-width="6"/>
    <rect x="552" y="536" width="30" height="270" rx="15" fill="#FFFFFF" fill-opacity="0.62"/>
    <rect x="588" y="636" width="152" height="120" rx="12" fill="#FFFFFF" fill-opacity="0.78"/>
    <text x="664" y="716" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="6" fill="url(#hg)">VE</text>
  </g>

  <!-- lipstick -->
  <g transform="translate(-118 88) scale(0.94)">
    <rect x="176" y="700" width="118" height="230" rx="22" fill="url(#hg)"/>
    <rect x="188" y="636" width="94" height="86" rx="10" fill="url(#hw)"/>
    <path d="M192 648 L278 648 L278 520 C 278 474 240 450 236 450 C 232 450 192 474 192 520 Z" fill="url(#hr)"/>
    <path d="M206 646 L236 646 L236 494 C 236 472 228 462 220 456 Z" fill="#FFFFFF" fill-opacity="0.26"/>
  </g>

  <!-- compact -->
  <g transform="translate(300 520) scale(0.56)">
    <circle cx="400" cy="640" r="196" fill="url(#hw)"/>
    <circle cx="400" cy="640" r="196" fill="none" stroke="url(#hg)" stroke-width="8"/>
    <circle cx="400" cy="640" r="160" fill="#E5A3A8" opacity="0.92"/>
    <path d="M400 480 A 160 160 0 0 1 560 640 L 400 640 Z" fill="#FFFFFF" fill-opacity="0.24"/>
    <g stroke="url(#hg)" stroke-width="4" fill="none" opacity="0.7">
      <circle cx="400" cy="640" r="112"/>
      <circle cx="400" cy="640" r="66"/>
    </g>
  </g>

  <!-- palette -->
  <g transform="translate(-330 470) scale(0.62) rotate(-8 400 580)">
    <rect x="166" y="386" width="468" height="392" rx="44" fill="url(#hw)"/>
    <rect x="166" y="386" width="468" height="392" rx="44" fill="none" stroke="url(#hg)" stroke-width="8"/>
    <rect x="192" y="412" width="416" height="216" rx="26" fill="#FFFFFF" fill-opacity="0.5"/>
    <rect x="216" y="452" width="84" height="84" rx="20" fill="#F6DADA"/>
    <rect x="318" y="452" width="84" height="84" rx="20" fill="#E7B0A5"/>
    <rect x="420" y="452" width="84" height="84" rx="20" fill="#C67A6D"/>
    <rect x="522" y="452" width="84" height="84" rx="20" fill="#96525D"/>
    <rect x="216" y="592" width="84" height="84" rx="20" fill="#E3CD9C"/>
    <rect x="318" y="592" width="84" height="84" rx="20" fill="#D79184"/>
    <rect x="420" y="592" width="84" height="84" rx="20" fill="#B76E79"/>
    <rect x="522" y="592" width="84" height="84" rx="20" fill="#653740"/>
  </g>
</svg>
`;
  await writeFile(join(root, "public", "hero.svg"), hero, "utf8");

  console.log(
    `Generated ${ART.length} product illustrations, ${COLLECTIONS.length} collection images and hero.svg`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
