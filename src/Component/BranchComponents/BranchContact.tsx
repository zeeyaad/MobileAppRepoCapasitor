import React from "react";

const BranchContact = ({ branch }: { branch: any }) => {
  return (
    <aside className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-3">معلومات التواصل</h3>
      <p><strong>المدير:</strong> {branch.manager}</p>
      <p><strong>الهاتف:</strong> {branch.phone}</p>
      <p><strong>البريد الإلكتروني:</strong> {branch.email}</p>
      <p><strong>العنوان:</strong> {branch.address}</p>
    </aside>
  );
};

export default BranchContact;
