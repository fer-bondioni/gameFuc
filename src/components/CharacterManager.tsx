"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Character {
  id: string;
  name: string;
  image_url: string;
}

export default function CharacterManager() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    image_url: "",
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
      const { data, error } = await supabase
        .from("characters")
        .insert([newCharacter])
        .select()
        .single();

      if (error) throw error;

      setCharacters([...characters, data]);
      setNewCharacter({
        name: "",
        image_url: "",
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
    if (!window.confirm("Are you sure you want to delete this character?")) return;

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
    return <div>Loading characters...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Create new character form */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Character</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Character Name</label>
            <input
              type="text"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Character Image</label>
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
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
          >
            Create Character
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
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCharacter(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <img
                  src={character.image_url}
                  alt={character.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h4 className="font-medium text-lg">{character.name}</h4>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setEditingCharacter(character)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
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