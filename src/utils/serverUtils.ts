import { arrayify } from "ethers/lib/utils";

export function toBuffer(hexString: string) {
  return Buffer.from(arrayify(hexString));
}
