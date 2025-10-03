"use client";

import { useState, useEffect } from "react";
import TabNavigation from "@/components/TabNavigation";
import GamePage from "./game/page";
import StatsPage from "./stats/page";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"game" | "stats">("game");
  
  useEffect(() => {
    const tab = searchParams.get("tab") as "game" | "stats";
    if (tab && (tab === "game" || tab === "stats")) {
      setActiveTab(tab);
    } else {
      setActiveTab("game"); // Default to game tab when no tab parameter is present
    }
  }, [searchParams]);

  const handleTabChange = (tab: "game" | "stats") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "game") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="mt-8">
        {activeTab === "game" ? <GamePage /> : <StatsPage />}
      </main>
    </div>
  );
}
