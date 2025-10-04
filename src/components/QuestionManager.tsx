"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  text: string;
  image_url?: string;
  correct_answer: string;
  wrong_answers: string[];
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    image_url: "",
    correct_answer: "",
    wrong_answers: ["", "", ""]
  });

  // Load questions when component mounts
  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });

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
      const { data, error } = await supabase
        .from("questions")
        .insert([newQuestion])
        .select()
        .single();

      if (error) throw error;

      setQuestions([data, ...questions]);
      setNewQuestion({
        text: "",
        image_url: "",
        correct_answer: "",
        wrong_answers: ["", "", ""]
      });
    } catch (error) {
      console.error("Error creating question:", error);
    }
  }

  async function handleUpdateQuestion(question: Question) {
    try {
      const { error } = await supabase
        .from("questions")
        .update(question)
        .eq("id", question.id);

      if (error) throw error;

      setQuestions(questions.map(q => q.id === question.id ? question : q));
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
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
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleImageUpload(file);
                  if (url) {
                    setNewQuestion({ ...newQuestion, image_url: url });
                  }
                }
              }}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <input
              type="text"
              value={newQuestion.correct_answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Wrong Answers</label>
            {newQuestion.wrong_answers.map((answer, index) => (
              <input
                key={index}
                type="text"
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...newQuestion.wrong_answers];
                  newAnswers[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, wrong_answers: newAnswers });
                }}
                className="w-full p-2 border rounded-lg mb-2"
                placeholder={`Wrong answer ${index + 1}`}
              />
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
                <input
                  type="text"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={editingQuestion.correct_answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                {editingQuestion.wrong_answers.map((answer, index) => (
                  <input
                    key={index}
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...editingQuestion.wrong_answers];
                      newAnswers[index] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, wrong_answers: newAnswers });
                    }}
                    className="w-full p-2 border rounded-lg"
                  />
                ))}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateQuestion(editingQuestion)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-medium">{question.text}</p>
                {question.image_url && (
                  <img src={question.image_url} alt="Question" className="mt-2 max-w-xs rounded" />
                )}
                <p className="text-green-600 dark:text-green-400 mt-2">
                  Correct: {question.correct_answer}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Wrong answers:</p>
                  <ul className="list-disc list-inside">
                    {question.wrong_answers.map((answer, index) => (
                      <li key={index} className="text-red-600 dark:text-red-400">
                        {answer}
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