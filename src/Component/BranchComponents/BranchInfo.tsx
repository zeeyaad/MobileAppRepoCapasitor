import React from "react";

const BranchInfo = ({ branch }: { branch: any }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">عن الفرع</h2>
      <p className="text-gray-700 leading-relaxed">{branch.about}</p>
      <div className="mt-4">
        <h3 className="font-semibold">ساعات العمل:</h3>
        <p>{branch.hours}</p>
      </div>
    </section>
  );
};

export default BranchInfo;
