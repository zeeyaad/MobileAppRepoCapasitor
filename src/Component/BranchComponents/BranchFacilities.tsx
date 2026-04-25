import React from "react";

const BranchFacilities = ({ facilities }: { facilities: string[] }) => {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-2">المرافق</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {facilities.map((f, i) => (
          <li key={i} className="bg-gray-100 text-gray-700 p-2 rounded-lg">
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BranchFacilities;
