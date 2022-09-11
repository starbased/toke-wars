import Image from "next/future/image";
import { ReactNode } from "react";

export function Coin({
  coin,
  children,
}: {
  coin: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-1 items-center">
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
