import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/groups", label: "Groups", icon: "fas fa-users" },
    { path: "/friends", label: "Friends", icon: "fas fa-user-friends" },
  ];

  return (
    <nav className="bg-cred-gray border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-cred-gradient bg-clip-text text-transparent">
              Spliq
            </div>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`transition-colors ${
                    location === item.path
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <div className="flex items-center space-x-3">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-cred-gradient rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-400 hover:text-white hidden sm:inline-flex"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
