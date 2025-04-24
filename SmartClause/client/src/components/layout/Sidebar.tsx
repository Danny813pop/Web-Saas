import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Edit,
  HelpCircle,
  User,
  LogOut,
  X,
  Menu
} from "lucide-react";
import logoPath from '../../assets/logo.png';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  
  // Set sidebar to open by default on larger screens, closed on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Map routes to their icon components
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/analyzer", label: "Contract Analyzer", icon: <FileText className="w-5 h-5" /> },
    { path: "/generator", label: "Clause Generator", icon: <Edit className="w-5 h-5" /> },
    { path: "/qa", label: "Contract Q&A", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/account", label: "Account", icon: <User className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Sidebar overlay - only shown when sidebar is open on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle button in header for small screens */}
      <button
        className="fixed top-4 left-4 rounded-md bg-primary-700 p-2 text-white shadow-md z-20 md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 bg-gradient-to-b from-primary-900 to-primary-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-30 flex flex-col shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-primary-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logoPath} alt="SmartClause Logo" className="h-9" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200">
                SmartClause
              </h1>
            </div>
            
            {/* Close button */}
            <button
              className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-primary-700/60 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-center text-primary-300 mt-1">AI-Powered Contract Analysis</div>
        </div>
      
        <nav className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700">
          <div className="px-4 pt-6 pb-2 text-xs font-semibold text-primary-200 tracking-wider uppercase">Menu</div>
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path} className="group">
                <Link href={item.path}>
                  <div className={cn(
                    "relative flex items-center px-3 py-3 rounded-md transition-all duration-200 group-hover:bg-primary-700/70",
                    location === item.path 
                      ? "bg-primary-600 text-white shadow-sm" 
                      : "text-gray-200 hover:text-white"
                  )}>
                    <div className={cn(
                      "absolute left-0 w-1 h-5 rounded-r-full transition-all",
                      location === item.path 
                        ? "bg-white opacity-100" 
                        : "bg-primary-200 opacity-0 group-hover:opacity-50"
                    )}/>
                    <span className={cn(
                      "w-6 ml-1 transition-colors",
                      location === item.path 
                        ? "text-white" 
                        : "text-primary-300 group-hover:text-primary-200"
                    )}>
                      {item.icon}
                    </span>
                    <span className={cn(
                      "ml-3 font-medium transition-all",
                      location === item.path && "font-semibold"
                    )}>
                      {item.label}
                    </span>
                    {location === item.path && (
                      <div className="absolute right-3 flex items-center">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t border-primary-700/50 bg-primary-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-primary-200">{user?.planType === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
              </div>
            </div>
            <button 
              className="p-2 rounded-full text-primary-300 hover:text-white hover:bg-primary-700/50 transition-colors" 
              onClick={logout}
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}