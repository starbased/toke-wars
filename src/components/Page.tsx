import { HTMLAttributes } from "react";

export function Page(
  props: {
    header?: string;
  } & HTMLAttributes<HTMLDivElement>
) {
  const { header, ...divProps } = props;

  return (
    <main
      {...divProps}
      className={`container mx-auto flex flex-col space-y-10 ${
        props.className || ""
      }`}
    >
      {header ? (
        <h1 className="text-4xl font-bold text-center">{header}</h1>
      ) : null}

      {props.children}
    </main>
  );
}
