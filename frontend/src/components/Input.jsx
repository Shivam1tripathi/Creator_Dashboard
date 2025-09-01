const Input = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder = " ",
  error = false,
  helperText = "",
  color = "purple", // ✅ added color support
}) => {
  // 🎨 Tailwind dynamic styles
  const colors = {
    purple: {
      border: "focus:border-purple-400 focus:ring-purple-500",
      label:
        "peer-focus:text-purple-400 peer-focus:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]",
    },
    blue: {
      border: "focus:border-blue-400 focus:ring-blue-500",
      label:
        "peer-focus:text-blue-400 peer-focus:drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]",
    },
    pink: {
      border: "focus:border-pink-400 focus:ring-pink-500",
      label:
        "peer-focus:text-pink-400 peer-focus:drop-shadow-[0_0_6px_rgba(236,72,153,0.9)]",
    },
    green: {
      border: "focus:border-green-400 focus:ring-green-500",
      label:
        "peer-focus:text-green-400 peer-focus:drop-shadow-[0_0_6px_rgba(34,197,94,0.9)]",
    },
  };

  const theme = colors[color] || colors.purple;

  return (
    <div className="relative w-full mb-4">
      {/* Input Field */}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder} // needed for floating label
        required
        className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border text-white 
        ${
          error
            ? "border-red-500 focus:ring-red-500"
            : `border-gray-600/40 ${theme.border}`
        } 
        focus:ring-2 outline-none transition-all duration-300`}
      />

      {/* Floating Label */}
      {label && (
        <label
          htmlFor={name}
          className={`absolute left-3 top-2 text-gray-400 text-xs transition-all duration-300
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500/70
          ${error ? "text-red-400" : theme.label}`}
        >
          {label}
        </label>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-400 mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
