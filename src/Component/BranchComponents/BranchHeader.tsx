import React from 'react';

export default function BranchHeader({ branch }: { branch: any }) {
  return (
    <div className="text-center border-b pb-2 mb-2">
      <h2 className="text-2xl font-semibold">{branch.name}</h2>
      <p className="text-gray-600">{branch.address}</p>
    </div>
  );
}
