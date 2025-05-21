import { DashboardTimetable } from "./_components/DashboardTimetable";

export default function TimetablePage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Train Timetable</h1>
      <DashboardTimetable />
    </div>
  );
}
