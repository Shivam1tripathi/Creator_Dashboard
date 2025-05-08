export default function ProfileStatus({ completed }) {
  return (
    <div
      className={`text-sm px-3 py-1 rounded-full ${
        completed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      Profile {completed ? "Completed" : "Incomplete"}
    </div>
  );
}
