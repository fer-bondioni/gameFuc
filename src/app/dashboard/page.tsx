"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionManager from "@/components/QuestionManager";
import CharacterManager from "@/components/CharacterManager";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<"questions" | "characters">("questions");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Game Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage questions, answers, and characters for the game
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveSection("questions")}
          className={`px-4 py-2 rounded-lg ${
            activeSection === "questions"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          Questions & Answers
        </button>
        <button
          onClick={() => setActiveSection("characters")}
          className={`px-4 py-2 rounded-lg ${
            activeSection === "characters"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          Characters
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        {activeSection === "questions" ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>
            <QuestionManager />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Characters</h2>
            <CharacterManager />
          </div>
        )}
      </div>
    </div>
  );
}