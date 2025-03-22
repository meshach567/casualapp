import { create } from "zustand";
import { FormulaState } from "../types/casual";

export const useFormulaStore = create<FormulaState>((set) => ({
    tokens: [],
    cursorIndex: 0,
    addToken: (token, atIndex) => 
      set((state) => {
        const index = atIndex !== undefined ? atIndex : state.cursorIndex;
        const newTokens = [
          ...state.tokens.slice(0, index),
          token,
          ...state.tokens.slice(index)
        ];
        return {
          tokens: newTokens,
          cursorIndex: index + 1
        };
      }),
    removeToken: (id) =>
      set((state) => {
        const indexToRemove = state.tokens.findIndex(t => t.id === id);
        if (indexToRemove === -1) return state;
        
        const newTokens = state.tokens.filter(t => t.id !== id);
        return {
          tokens: newTokens,
          cursorIndex: indexToRemove < state.cursorIndex 
            ? Math.max(0, state.cursorIndex - 1) 
            : state.cursorIndex
        };
      }),
    removeTokenAtIndex: (index) =>
      set((state) => {
        if (index < 0 || index >= state.tokens.length) return state;
        
        const newTokens = [
          ...state.tokens.slice(0, index),
          ...state.tokens.slice(index + 1)
        ];
        
        return {
          tokens: newTokens,
          cursorIndex: index < state.cursorIndex 
            ? Math.max(0, state.cursorIndex - 1) 
            : state.cursorIndex
        };
      }),
    updateToken: (id, value) =>
      set((state) => ({
        tokens: state.tokens.map(token =>
          token.id === id ? { ...token, value } : token
        )
      })),
    setCursorIndex: (index) =>
      set(() => ({ cursorIndex: index })),
    moveCursorLeft: () =>
      set((state) => ({
        cursorIndex: Math.max(0, state.cursorIndex - 1)
      })),
    moveCursorRight: () =>
      set((state) => ({
        cursorIndex: Math.min(state.tokens.length, state.cursorIndex + 1)
      }))
  }));