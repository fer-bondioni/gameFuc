import { create } from "zustand";
import { GameState } from "@/types/game";

export const useGameStore = create<GameState>(() => ({
  currentStep: "name",
  userName: "",
  currentQuestionIndex: 0,
  answers: {},
  resultCharacter: null,
}));

export const gameActions = {
  setUserName: (name: string) =>
    useGameStore.setState({ userName: name, currentStep: "questions" }),

  submitAnswer: (questionId: string, answerId: string) =>
    useGameStore.setState((state) => ({
      answers: { ...state.answers, [questionId]: answerId },
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  setResult: (character: GameState["resultCharacter"]) =>
    useGameStore.setState({
      resultCharacter: character,
      currentStep: "result",
    }),

  resetGame: () =>
    useGameStore.setState({
      currentStep: "name",
      userName: "",
      currentQuestionIndex: 0,
      answers: {},
      resultCharacter: null,
    }),
};
