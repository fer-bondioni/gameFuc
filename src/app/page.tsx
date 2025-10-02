"use client";

import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import GamePage from "./game/page";
import StatsPage from "./stats/page";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"game" | "stats">("game");

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="mt-8">
        {activeTab === "game" ? <GamePage /> : <StatsPage />}
      </main>
    </div>
  );
}
