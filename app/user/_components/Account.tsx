import React from "react";

interface AccountProps {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
  };
}

const Account: React.FC<AccountProps> = ({ user }) => {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Account</h2>
      <div className="grid grid-cols-3 w-full  gap-4">
        {Object.entries(user).map(([key, value]) => (
          <div key={key}>
            <p className="font-bold">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </p>
            <p className="flex-wrap  text-base break-all h-auto w-full">
              {value}
            </p>
          </div>
        ))}
        <button className="col-start-3 px-2 py-1 text-white bg-green-500 rounded">
          Change
        </button>
      </div>
    </div>
  );
};

export default Account;
