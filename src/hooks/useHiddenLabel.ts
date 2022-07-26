import { useState } from "react";
import { DataKey } from "recharts/types/util/types";
import { Payload } from "recharts/types/component/DefaultLegendContent";

export function useHiddenLabels() {
  const [hidden, setHidden] = useState<string[]>([]);

  return {
    onClick: (
      data: Payload & {
        dataKey?: DataKey<any>;
      }
    ) => {
      const dataKey = data.dataKey?.toString();
      if (dataKey === undefined) {
        throw new Error("unknown Data Key");
      }

      if (hidden.includes(dataKey)) {
        hidden.splice(hidden.indexOf(dataKey), 1);
        setHidden([...hidden]);
      } else {
        setHidden([...hidden, dataKey]);
      }
    },
    shouldHide: (key: string) => hidden.includes(key),
  };
}
