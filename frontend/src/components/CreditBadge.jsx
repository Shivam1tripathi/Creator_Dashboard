export default function CreditBadge({ credits }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold 
      bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 
      text-yellow-900 shadow-md border border-yellow-300/60 
      hover:shadow-lg hover:scale-105 transition-transform duration-300"
    >
      {/* Coin Icon */}
      <span className="w-4 h-4 bg-yellow-500 rounded-full shadow-inner border border-yellow-300"></span>
      Credits: <span className="text-yellow-900">{credits}</span>
    </div>
  );
}
