export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96 relative z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
