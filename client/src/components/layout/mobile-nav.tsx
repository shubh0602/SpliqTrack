import { useLocation } from "wouter";
import { useState } from "react";
import AddExpenseModal from "@/components/modals/add-expense-modal";

export default function MobileNav() {
  const [location] = useLocation();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/groups", label: "Groups", icon: "fas fa-users" },
    { path: "/friends", label: "Friends", icon: "fas fa-user-friends" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-cred-gray border-t border-gray-800 md:hidden z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 2).map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 ${
                location === item.path ? "text-white" : "text-gray-400"
              }`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs">{item.label}</span>
            </a>
          ))}
          
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <div className="bg-cred-gradient w-12 h-12 rounded-full flex items-center justify-center -mt-4 mb-1">
              <i className="fas fa-plus text-white text-lg"></i>
            </div>
          </button>
          
          {navItems.slice(2).map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 ${
                location === item.path ? "text-white" : "text-gray-400"
              }`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs">{item.label}</span>
            </a>
          ))}
          
          <button className="flex flex-col items-center p-2 text-gray-400">
            <i className="fas fa-chart-bar text-lg mb-1"></i>
            <span className="text-xs">Reports</span>
          </button>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={() => setIsExpenseModalOpen(false)}
        isLoading={false}
      />
    </>
  );
}
