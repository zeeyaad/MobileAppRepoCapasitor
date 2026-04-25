import React from "react";

const BranchGallery = ({ photos }: { photos: string[] }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">الصور</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Photo ${idx + 1}`}
            className="w-full h-40 object-cover rounded-lg"
          />
        ))}
      </div>
    </section>
  );
};

export default BranchGallery;
