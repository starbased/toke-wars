import { HTMLAttributes } from "react";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`border-gray-500 border rounded-lg p-5 space-y-1 m-2 ${props.className}`}
    />
  );
}
