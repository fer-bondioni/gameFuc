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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/dashboard/login");
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
          ⚙️ Panel de Administración
        </h1>
        <p className="text-xl font-bold text-white mt-4 drop-shadow-lg">
          Administrá preguntas, respuestas y personajes del juego
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setActiveSection("questions")}
          className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg ${
            activeSection === "questions"
              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-pink-500/50"
              : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          }`}
        >
          ❓ Preguntas y Respuestas
        </button>
        <button
          onClick={() => setActiveSection("characters")}
          className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg ${
            activeSection === "characters"
              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-pink-500/50"
              : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          }`}
        >
          👥 Personajes
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-white/20">
        {activeSection === "questions" ? (
          <div>
            <h2 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              ❓ Preguntas y Respuestas
            </h2>
            <QuestionManager />
          </div>
        ) : (
          <div>
            <h2 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              👥 Personajes
            </h2>
            <CharacterManager />
          </div>
        )}
      </div>
    </div>
  );
}