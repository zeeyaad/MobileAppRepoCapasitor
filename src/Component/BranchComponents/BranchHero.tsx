import React from "react";

const BranchHero = ({ branch }: { branch: any }) => {
  return (
    <div className="relative w-full h-56 md:h-72">
      <img
        src={branch.photos?.[0] || "/placeholder.jpg"}
        alt={branch.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl font-bold">{branch.name}</h1>
      </div>
    </div>
  );
};

export default BranchHero;
