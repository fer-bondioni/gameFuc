"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let error;
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        error = signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInError;
      }

      if (error) throw error;

      // Redirect to dashboard
      window.location.href = "/?tab=dashboard";
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-white/20">
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
        Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-1 text-gray-900">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-500 text-gray-900 font-medium"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-1 text-gray-900">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-500 text-gray-900 font-medium"
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2 font-bold">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-6 rounded-2xl font-extrabold hover:shadow-xl hover:shadow-pink-500/50 disabled:opacity-50 disabled:grayscale transition-all duration-300 transform hover:scale-105"
        >
          {loading ? (isSignUp ? "Registrando..." : "Iniciando sesión...") : (isSignUp ? "Registrarse" : "Iniciar Sesión")}
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm font-bold text-gray-700 hover:text-purple-600 mt-2 transition-colors"
        >
          {isSignUp ? "¿Ya tenés una cuenta? Iniciar Sesión" : "¿Necesitás una cuenta? Registrarse"}
        </button>
      </form>
    </div>
  );
}