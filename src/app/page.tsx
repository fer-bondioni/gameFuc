"use client";

import { useState, useEffect } from "react";
import TabNavigation from "@/components/TabNavigation";
import GamePage from "./game/page";
import StatsPage from "./stats/page";
import DashboardPage from "./dashboard/page";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"game" | "stats" | "dashboard">("game");
  
  useEffect(() => {
    const tab = searchParams.get("tab") as "game" | "stats" | "dashboard" | null;
    const validTabs = ["game", "stats", "dashboard"];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab as "game" | "stats" | "dashboard");
    } else {
      setActiveTab("game");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "game" | "stats" | "dashboard") => {
    setActiveTab(tab);
    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams();
    
    // Preserve all existing params except 'tab'
    currentParams.forEach((value, key) => {
      if (key !== 'tab') {
        newParams.set(key, value);
      }
    });

    // Only add tab parameter if it's not the game tab
    if (tab !== "game") {
      newParams.set("tab", tab);
    }

    const queryString = newParams.toString();
    const url = queryString ? `/?${queryString}` : '/';
    router.replace(url);
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="mt-8">
        {activeTab === "game" ? (
          <GamePage />
        ) : activeTab === "stats" ? (
          <StatsPage />
        ) : (
          <DashboardPage />
        )}
      </main>
    </div>
  );
}
