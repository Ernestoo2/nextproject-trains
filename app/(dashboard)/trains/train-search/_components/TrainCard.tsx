import Link from "next/link";
import { Train } from "@/utils/mongodb/models";

interface TrainCardProps {
  train: {
    _id: string;
    trainName: string;
    trainNumber: string;
    isActive: boolean;
    classes?: Array<{
      _id?: string;
      code: string;
      name: string;
    }>;
  };
}

export default function TrainCard({ train }: TrainCardProps) {
  return (
    <div className="border-b my-5 px-4 rounded-md bg-white shadow-md border-[#D1D5DB] py-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{train.trainName}</h3>
          <p className="text-sm text-[#6B7280]">Train No: {train.trainNumber}</p>
        </div>
        <Link
          href={`/trains/train-timetable?trainId=${train._id}`}
          className="text-sm text-[#16A34A] hover:underline"
        >
          View train time table
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-sm text-[#6B7280]">Available Classes:</p>
        <div className="flex gap-2 mt-2">
          {train.classes && train.classes.length > 0 ? (
            train.classes.map((trainClass) => (
              <span
                key={trainClass._id?.toString() || `class-${trainClass.code}`}
                className="text-xs border rounded-md px-2 py-1 border-[#07561A]"
              >
                {trainClass.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No class information available</span>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <span className={`px-2 py-1 rounded ${
          train.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {train.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}
