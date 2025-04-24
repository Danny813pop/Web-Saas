import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import logoPath from '../../assets/logo.png';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <header className="md:hidden bg-primary-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="text-white mr-4"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <img src={logoPath} alt="SmartClause Logo" className="h-8 mr-2" />
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button className="flex items-center">
            <span className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
