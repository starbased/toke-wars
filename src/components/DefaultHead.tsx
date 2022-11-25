import { PropsWithChildren } from "react";

export default function DefaultHead({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <>
      <title>{title}</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link rel="icon" href="/favicon.png" />
      {description ? (
        <meta
          name="description"
          content="See how Tokemak reward emissions are changing over time."
        />
      ) : null}

      {children}
    </>
  );
}
