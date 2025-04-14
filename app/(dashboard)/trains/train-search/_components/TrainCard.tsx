import Link from "next/link";
import { ITrain } from "@/app/utils/mongodb/types";

interface TrainCardProps {
  train: ITrain;
}

export default function TrainCard({ train }: TrainCardProps) {
  const firstRoute = train.routes[0];
  const lastRoute = train.routes[train.routes.length - 1];

  return (
    <div className="border-b my-5 px-4 rounded-md bg-white shadow-md border-[#D1D5DB] py-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{train.trainName}</h3>
        <Link
          href={`/trains/train-timetable?trainId=${train._id}`}
          className="text-sm text-[#16A34A] hover:underline"
        >
          View train time table
        </Link>
      </div>

      <div className="flex justify-between mt-4">
        <div>
          <p className="text-sm font-medium">{firstRoute.departureTime}</p>
          <p className="text-sm text-[#6B7280]">{firstRoute.station.name}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-[#6B7280]">
            {lastRoute.day - firstRoute.day} days
          </span>
          <hr className="border-t border-[#D1D5DB] w-full mt-1" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{lastRoute.arrivalTime}</p>
          <p className="text-sm text-[#6B7280]">{lastRoute.station.name}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-[#6B7280]">Available Classes:</p>
        <div className="flex gap-2 mt-2">
          {train.classes.map((trainClass) => (
            <span
              key={trainClass._id?.toString() || `class-${trainClass.code}`}
              className="text-xs border rounded-md px-2 py-1 border-[#07561A]"
            >
              {trainClass.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
