"use client";

import React from "react";
import { useSession } from "next-auth/react";

const Account: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
            Edit
          </button>
        </div>
        <div>
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Account;
