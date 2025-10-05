"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface CharacterPoint {
  id: string;
  answer_id: string;
  character_id: string;
  points: number;
}

interface Character {
  id: string;
  name: string;
  description: string;
  image_url?: string;
}

interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  image_url?: string;
  created_at: string;
  character_points?: CharacterPoint[];
}

interface Question {
  id: string;
  question_text: string;
  order_number: number;
  created_at: string;
  answers?: Answer[];
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    order_number: 1,
    answers: [
      { answer_text: "", image_url: "" },
      { answer_text: "", image_url: "" },
      { answer_text: "", image_url: "" },
      { answer_text: "", image_url: "" }
    ]
  });

  // Load questions and characters when component mounts
  useEffect(() => {
    loadQuestions();
    loadCharacters();
  }, []);

  async function loadCharacters() {
    try {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("name");

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error("Error loading characters:", error);
    }
  }

  async function loadQuestions() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          answers (
            id,
            answer_text,
            image_url,
            character_points (
              id,
              character_id,
              points
            )
          )
        `)
        .order("order_number", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(file: File) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `question-images/${fileName}`;

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

  async function handleCreateQuestion() {
    try {
      // First, get the max order number
      const { data: maxOrderData } = await supabase
        .from("questions")
        .select("order_number")
        .order("order_number", { ascending: false })
        .limit(1)
        .single();

      const newOrderNumber = (maxOrderData?.order_number || 0) + 1;

      // Create the question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([{
          question_text: newQuestion.question_text,
          order_number: newOrderNumber
        }])
        .select()
        .single();

      if (questionError) throw questionError;

      // Create the answers
      const answersToCreate = newQuestion.answers.map(answer => ({
        question_id: questionData.id,
        answer_text: answer.answer_text,
        image_url: answer.image_url
      }));

      const { data: answersData, error: answersError } = await supabase
        .from("answers")
        .insert(answersToCreate)
        .select();

      if (answersError) throw answersError;

      setQuestions([{
        ...questionData,
        answers: answersData
      }, ...questions]);

      setNewQuestion({
        question_text: "",
        order_number: 1,
        answers: [
          { answer_text: "", image_url: "" },
          { answer_text: "", image_url: "" },
          { answer_text: "", image_url: "" },
          { answer_text: "", image_url: "" }
        ]
      });
    } catch (error) {
      console.error("Error creating question:", error);
    }
  }

  async function handleCharacterPointChange(answerId: string, characterId: string, points: number) {
    try {
      // Check if a character point record already exists
      const { data: existingPoints } = await supabase
        .from('character_points')
        .select('id')
        .match({ answer_id: answerId, character_id: characterId })
        .single();

      if (existingPoints) {
        // Update existing record
        const { error } = await supabase
          .from('character_points')
          .update({ points })
          .match({ answer_id: answerId, character_id: characterId });

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('character_points')
          .insert([{
            answer_id: answerId,
            character_id: characterId,
            points
          }]);

        if (error) throw error;
      }

      // Update local state
      const updatedQuestions = questions.map(q => ({
        ...q,
        answers: q.answers?.map(a => {
          if (a.id === answerId) {
            const existingPoints = a.character_points || [];
            const pointIndex = existingPoints.findIndex(cp => cp.character_id === characterId);
            
            if (pointIndex >= 0) {
              existingPoints[pointIndex] = { ...existingPoints[pointIndex], points };
            } else {
              existingPoints.push({
                id: 'temp-' + Math.random(), // Will be replaced on next load
                answer_id: answerId,
                character_id: characterId,
                points
              });
            }
            
            return { ...a, character_points: existingPoints };
          }
          return a;
        })
      }));
      
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Error updating character points:", error);
    }
  }

  async function handleUpdateQuestion(question: Question) {
    try {
      // Update question text
      const { error: questionError } = await supabase
        .from("questions")
        .update({
          question_text: question.question_text
        })
        .eq("id", question.id);

      if (questionError) throw questionError;

      // Update answers and character points
      const updatePromises = question.answers?.map(async answer => {
        // Update answer
        await supabase
          .from("answers")
          .update({
            answer_text: answer.answer_text,
            image_url: answer.image_url
          })
          .eq("id", answer.id);

        // Update character points
        const characterPoints = answer.character_points || [];
        for (const point of characterPoints) {
          if (point.id.startsWith('temp-')) {
            // Create new character point
            await supabase
              .from('character_points')
              .insert([{
                answer_id: answer.id,
                character_id: point.character_id,
                points: point.points
              }]);
          } else {
            // Update existing character point
            await supabase
              .from('character_points')
              .update({ points: point.points })
              .eq("id", point.id);
          }
        }
      }) || [];

      await Promise.all(updatePromises);

      // Reload questions to get fresh data
      await loadQuestions();
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  }

  async function handleCancelEdit() {
    if (editingQuestion) {
      const hasChanges = JSON.stringify(editingQuestion) !== JSON.stringify(
        questions.find(q => q.id === editingQuestion.id)
      );

      if (!hasChanges || window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
        setEditingQuestion(null);
      }
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  }

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Create new question form */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Question</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question Text</label>
            <input
              type="text"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Answers</label>
            {newQuestion.answers.map((answer, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">
                  <input
                    type="text"
                    value={answer.answer_text}
                    onChange={(e) => {
                      const newAnswers = [...newQuestion.answers];
                      newAnswers[index] = { ...answer, answer_text: e.target.value };
                      setNewQuestion({ ...newQuestion, answers: newAnswers });
                    }}
                    className="w-full p-2 border rounded-lg mb-2"
                    placeholder={`Answer ${index + 1}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        if (url) {
                          const newAnswers = [...newQuestion.answers];
                          newAnswers[index] = { ...answer, image_url: url };
                          setNewQuestion({ ...newQuestion, answers: newAnswers });
                        }
                      }
                    }}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateQuestion}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
          >
            Create Question
          </button>
        </div>
      </div>

      {/* List of existing questions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Existing Questions</h3>
        {questions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {editingQuestion?.id === question.id ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <label className="block text-sm font-medium mb-1">Question Text</label>
                  <input
                    type="text"
                    value={editingQuestion.question_text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Answers</h4>
                  {editingQuestion.answers?.map((answer, index) => (
                    <div key={answer.id} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Answer Text</label>
                          <input
                            type="text"
                            value={answer.answer_text}
                            onChange={(e) => {
                              const newAnswers = [...(editingQuestion.answers || [])];
                              newAnswers[index] = { ...answer, answer_text: e.target.value };
                              setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                            }}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Answer Image</label>
                          {answer.image_url ? (
                            <div>
                              <img src={answer.image_url} alt="Answer" className="mt-2 max-w-xs rounded" />
                              <button
                                onClick={() => {
                                  const newAnswers = [...(editingQuestion.answers || [])];
                                  newAnswers[index] = { ...answer, image_url: undefined };
                                  setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                                }}
                                className="text-red-600 text-sm mt-1"
                              >
                                Remove image
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleImageUpload(file);
                                  if (url) {
                                    const newAnswers = [...(editingQuestion.answers || [])];
                                    newAnswers[index] = { ...answer, image_url: url };
                                    setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                                  }
                                }
                              }}
                              className="w-full p-2 border rounded-lg"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Character Points</label>
                          <div className="grid grid-cols-2 gap-4">
                            {characters.map(character => {
                              const characterPoint = answer.character_points?.find(
                                cp => cp.character_id === character.id
                              );
                              return (
                                <div key={character.id} className="flex items-center space-x-2">
                                  <span className="text-sm">{character.name}:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={characterPoint?.points || 0}
                                    onChange={(e) => {
                                      const newPoints = parseInt(e.target.value);
                                      const newAnswers = [...(editingQuestion.answers || [])];
                                      const currentPoints = newAnswers[index].character_points || [];
                                      const pointIndex = currentPoints.findIndex(cp => cp.character_id === character.id);
                                      
                                      if (pointIndex >= 0) {
                                        currentPoints[pointIndex].points = newPoints;
                                      } else {
                                        currentPoints.push({
                                          id: 'temp-' + Math.random(),
                                          answer_id: answer.id,
                                          character_id: character.id,
                                          points: newPoints
                                        });
                                      }
                                      
                                      newAnswers[index] = { ...answer, character_points: currentPoints };
                                      setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                                    }}
                                    className="w-20 p-1 border rounded"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateQuestion(editingQuestion)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-medium">{question.question_text}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Answers:</p>
                  <ul className="space-y-2">
                    {question.answers?.map((answer, index) => (
                      <li key={answer.id} className="flex items-start space-x-2">
                        <span>{index + 1}.</span>
                        <div>
                          <p>{answer.answer_text}</p>
                          {answer.image_url && (
                            <img src={answer.image_url} alt="Answer" className="mt-2 max-w-xs rounded" />
                          )}
                          <div className="mt-2">
                            <p className="text-sm font-medium">Character Points:</p>
                            <div className="space-y-2 mt-1">
                              {characters.map(character => {
                                const characterPoint = answer.character_points?.find(
                                  cp => cp.character_id === character.id
                                );
                                return (
                                  <div key={character.id} className="flex items-center space-x-2">
                                    <span className="text-sm">{character.name}:</span>
                                    <span className="text-sm font-medium">{characterPoint?.points || 0}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
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