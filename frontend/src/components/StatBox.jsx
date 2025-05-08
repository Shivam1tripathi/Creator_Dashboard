export default function StatBox({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
