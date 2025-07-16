const InputField = ({
  label,
  name,
  section,
  subSection,
  value,
  onChange,
  type = "text",
  required = false,
  options,
  placeholder,
}) => {
  const inputId = subSection
    ? `${section}_${subSection}_${name}`
    : `${section}_${name}`;
  const controlledValue = value ?? "";
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          id={inputId}
          name={name}
          value={controlledValue}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options &&
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={controlledValue}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

export default InputField;
