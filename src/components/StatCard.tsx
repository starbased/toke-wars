import { HTMLAttributes, ReactNode } from "react";
import { Card } from "./Card";

export function StatCard(
  props: {
    top: ReactNode;
    middle: ReactNode;
    bottom?: ReactNode;
  } & HTMLAttributes<HTMLDivElement>
) {
  const { top, middle, bottom, ...divProps } = props;

  return (
    <Card {...divProps}>
      {top}
      <div className="text-2xl">{middle}</div>
      {bottom ? <div className="font-light text-gray-300">{bottom}</div> : null}
    </Card>
  );
}
