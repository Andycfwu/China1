import { existsSync } from "node:fs";
import path from "node:path";

export type AssetSlot = {
  src: string;
  label: string;
  exists: boolean;
};

const publicDir = path.join(process.cwd(), "public");

function imageSlot(src: string, label: string): AssetSlot {
  return {
    src,
    label,
    exists: existsSync(path.join(publicDir, src.replace(/^\//, ""))),
  };
}

export const imageAssets = {
  pandaLogo: imageSlot("/images/panda-logo.png", "Panda logo"),
  forestFull: imageSlot("/images/bamboo-forest-full.png", "Full bamboo forest background"),
};
