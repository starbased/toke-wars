"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function Selector({
  reactors,
  address,
}: {
  reactors: { symbol: string; address: string }[];
  address: string;
}) {
  const [currentAddress, setAddress] = useState(address);
  const router = useRouter();

  return (
    <select
      className="bg-gray-800 border-gray-600 border p-1  rounded-md"
      style={{ minWidth: "200px" }}
      placeholder="Select Token"
      name="token"
      value={currentAddress}
      onChange={(event) => {
        setAddress(event.currentTarget.value);
        router.replace(`/reactors/${event.currentTarget.value}`);
      }}
    >
      {reactors.map(({ symbol, address }) => (
        <option value={address} key={address}>
          {symbol}
        </option>
      ))}
    </select>
  );
}
