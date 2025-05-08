const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = " cursor-pointer",
}) => {
  const base = "px-4 py-2 rounded-lg font-medium focus:outline-none transition";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
