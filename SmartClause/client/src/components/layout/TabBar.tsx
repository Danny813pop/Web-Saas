import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  path: string;
  label: string;
}

export default function TabBar() {
  const [location, setLocation] = useLocation();
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  
  // Define available tabs
  const availableTabs: Tab[] = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyzer', label: 'Contract Analyzer' },
    { path: '/generator', label: 'Clause Generator' },
    { path: '/qa', label: 'Contract Q&A' },
    { path: '/account', label: 'Account' }
  ];

  // Update active tabs when location changes
  useEffect(() => {
    const currentTab = availableTabs.find(tab => tab.path === location);
    if (currentTab && !openTabs.some(tab => tab.path === currentTab.path)) {
      setOpenTabs(prev => [...prev, currentTab]);
    }
  }, [location, openTabs]);

  // Close a tab
  const closeTab = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Filter out the tab to close
    const newTabs = openTabs.filter(tab => tab.path !== path);
    setOpenTabs(newTabs);
    
    // If closing the active tab, navigate to the last tab or dashboard
    if (path === location) {
      const lastTab = newTabs[newTabs.length - 1];
      setLocation(lastTab?.path || '/dashboard');
    }
  };

  if (openTabs.length === 0) {
    return null;
  }

  // Handle tab click
  const handleTabClick = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="bg-gray-100 px-4 py-1 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
      <div className="flex">
        {openTabs.map((tab) => (
          <div key={tab.path} className="mr-2">
            <div
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                "flex items-center px-4 py-2 rounded-t-md font-medium cursor-pointer",
                "border border-b-0 border-gray-300",
                "transition-colors duration-200",
                location === tab.path
                  ? "bg-white text-primary-600 shadow-sm" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              <span>{tab.label}</span>
              <button
                onClick={(e) => closeTab(e, tab.path)}
                className="ml-2 rounded-full p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={`Close ${tab.label} tab`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}