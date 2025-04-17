interface TrainClass {
  id: string;
  name: string;
  code: string;
  baseFare: number;
  isActive: boolean;
}

interface PassengerDetails {
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

interface PassengerClassSelectorProps {
  availableClasses: TrainClass[];
  selectedClass: string;
  passengerCounts: PassengerDetails;
  onClassSelect: (classType: string) => void;
  onPassengerCountChange: (details: Partial<PassengerDetails>) => void;
}

export function PassengerClassSelector({
  availableClasses,
  selectedClass,
  passengerCounts,
  onClassSelect,
  onPassengerCountChange,
}: PassengerClassSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => onClassSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {availableClasses.map((cls) => (
            <option key={cls.id} value={cls.code}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Adults:</label>
          <input
            type="number"
            min={1}
            max={9}
            value={passengerCounts.adultCount}
            onChange={(e) => onPassengerCountChange({ adultCount: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Children:</label>
          <input
            type="number"
            min={0}
            max={9}
            value={passengerCounts.childCount}
            onChange={(e) => onPassengerCountChange({ childCount: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Infants:</label>
          <input
            type="number"
            min={0}
            max={9}
            value={passengerCounts.infantCount}
            onChange={(e) => onPassengerCountChange({ infantCount: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
} 