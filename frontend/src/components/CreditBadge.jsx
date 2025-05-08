export default function CreditBadge({ credits }) {
  return (
    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
      Credits: {credits}
    </div>
  );
}
