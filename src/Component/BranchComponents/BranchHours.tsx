import React from "react";

export default function BranchHours({ hours }: { hours: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">Opening Hours</h3>
      <p className="text-gray-700">{hours}</p>
    </div>
  );
}
