import * as React from "react";

interface GrowthCellProps {
  growth?: number;
}

export function GrowthCell({ growth }: GrowthCellProps) {
  if (typeof growth !== "number") {
    return <span className="text-gray-400">—</span>;
  }
  if (growth > 0) {
    return <span className="text-green-600">↑ {Math.abs(growth)}%</span>;
  }
  if (growth < 0) {
    return <span className="text-red-600">↓ {Math.abs(growth)}%</span>;
  }
  return <span className="text-gray-400">—</span>;
}
