"use client";

interface TabNavigationProps {
  activeTab: "game" | "stats";
  onTabChange: (tab: "game" | "stats") => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { name: "Game", value: "game" },
    { name: "Stats", value: "stats" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.value as "game" | "stats")}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${
                  isActive
                    ? "border-black text-black dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }
              `}
            >
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}