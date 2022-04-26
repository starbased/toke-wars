import Image from "next/image";
import { ReactNode } from "react";

export function Coin({
  coin,
  children,
}: {
  coin: string;
  children?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "5px" }}>
      <Image
        height={20}
        width={20}
        src={`/images/coins/${coin}.png`}
        alt={""}
      />
      {children}
    </div>
  );
}
