import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [value: T, fn: (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const value = localStorage.getItem(key);
    setValue(value ? JSON.parse(value) : []);
  }, [key]);

  function foo(value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
  }

  return [value, foo];
}
