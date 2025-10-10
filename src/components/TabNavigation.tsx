"use client";

interface TabNavigationProps {
  activeTab: "game" | "stats" | "dashboard";
  onTabChange: (tab: "game" | "stats" | "dashboard") => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { name: "Juego", value: "game", icon: "🎮" },
    { name: "Estadísticas", value: "stats", icon: "📊" },
    { name: "Panel", value: "dashboard", icon: "⚙️" },
  ];

  return (
    <div className="mb-8">
      <nav className="flex justify-center gap-4 flex-wrap" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.value as "game" | "stats" | "dashboard")}
              className={`
                px-6 py-3 rounded-full text-lg font-bold transition-all duration-300
                transform hover:scale-110 hover:-translate-y-1
                shadow-lg
                ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-pink-500/50"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
