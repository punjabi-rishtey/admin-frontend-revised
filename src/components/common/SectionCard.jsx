import { ChevronUp, ChevronDown } from "lucide-react";

const SectionCard = ({ title, icon, children, isExpanded, toggleSection }) => (
  <div className="bg-white rounded-lg shadow">
    <button
      className="w-full flex items-center justify-between p-6 text-left"
      onClick={toggleSection}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5 text-gray-600" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-600" />
      )}
    </button>
    {isExpanded && <div className="p-6 pt-0">{children}</div>}
  </div>
);

export default SectionCard;
