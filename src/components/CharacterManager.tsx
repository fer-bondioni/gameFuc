"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Character {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
}

interface NewCharacter {
  name: string;
  description: string;
  image_url: string | null;
}

type CharacterInsert = NewCharacter;

export default function CharacterManager() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState<NewCharacter>({
    name: "",
    description: "",
    image_url: null,
  });

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("name");

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error("Error loading characters:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(file: File) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `character-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("game-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("game-assets")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  async function handleCreateCharacter() {
    try {
      if (!newCharacter.name.trim()) {
        alert("Por favor ingresá un nombre para el personaje");
        return;
      }

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Por favor iniciá sesión para crear personajes");
        return;
      }

      const characterData: CharacterInsert = {
        name: newCharacter.name,
        description: newCharacter.description,
        image_url: newCharacter.image_url || null
      };
      
      const { data, error } = await supabase
        .from("characters")
        .insert([characterData])
        .select()
        .single();

      if (error) throw error;

      setCharacters([...characters, data]);
      setNewCharacter({
        name: "",
        description: "",
        image_url: null,
      });
    } catch (error) {
      console.error("Error creating character:", error);
    }
  }

  async function handleUpdateCharacter(character: Character) {
    try {
      const { error } = await supabase
        .from("characters")
        .update(character)
        .eq("id", character.id);

      if (error) throw error;

      setCharacters(characters.map(c => c.id === character.id ? character : c));
      setEditingCharacter(null);
    } catch (error) {
      console.error("Error updating character:", error);
    }
  }

  async function handleDeleteCharacter(id: string) {
    if (!window.confirm("¿Estás seguro que querés eliminar este personaje?")) return;

    try {
      const { error } = await supabase
        .from("characters")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCharacters(characters.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  }

  if (isLoading) {
    return <div className="text-center p-8"><p className="text-xl font-bold text-gray-900">Cargando personajes...</p></div>;
  }

  return (
    <div className="space-y-8">
      {/* Create new character form */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Crear Nuevo Personaje</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Nombre del Personaje</label>
            <input
              type="text"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Descripción</label>
            <textarea
              value={newCharacter.description}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Imagen del Personaje</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleImageUpload(file);
                  if (url) {
                    setNewCharacter({ ...newCharacter, image_url: url });
                  }
                }
              }}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <button
            onClick={handleCreateCharacter}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Crear Personaje
          </button>
        </div>
      </div>

      {/* List of existing characters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div key={character.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {editingCharacter?.id === character.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={(e) => setEditingCharacter({ ...editingCharacter, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleImageUpload(file);
                      if (url) {
                        setEditingCharacter({ ...editingCharacter, image_url: url });
                      }
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateCharacter(editingCharacter)}
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold py-2 px-6 rounded-2xl hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingCharacter(null)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {character.image_url ? (
                  <div className="relative w-full h-48 mb-2">
                    <Image
                      src={character.image_url}
                      alt={character.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                    Sin Imagen
                  </div>
                )}
                <h4 className="font-medium text-lg text-gray-900 dark:text-white">{character.name}</h4>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setEditingCharacter(character)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}