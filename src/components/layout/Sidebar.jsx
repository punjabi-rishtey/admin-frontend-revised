// components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Heart,
  BarChart2,
  HelpCircle,
  CreditCard,
  Tag,
  MessageSquare,
  Star,
  Settings,
  QrCode,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: Home },
    { path: "/users", name: "Users", icon: Users },
    { path: "/testimonials", name: "Testimonials", icon: Heart },
    { path: "/analytics", name: "Analytics", icon: BarChart2 },
    { path: "/support", name: "Support", icon: HelpCircle },
    { path: "/payments", name: "Payments", icon: CreditCard },
    { path: "/membership", name: "Membership", icon: Tag },
    { path: "/coupons", name: "Coupons", icon: Tag },
    { path: "/messages", name: "Messages", icon: MessageSquare },
    { path: "/reviews", name: "Reviews", icon: Star },
    // { path: '/utility', name: 'Utility', icon: Settings },
    { path: "/qr", name: "QR Code", icon: QrCode },
  ];

  return (
    <div
      className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out h-screen overflow-y-scroll no-scrollbar"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className="flex items-center space-x-2 px-4">
        <Heart className="h-8 w-8 text-purple-400" />
        <span className="text-2xl font-bold">Punjabi Rishtey</span>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
