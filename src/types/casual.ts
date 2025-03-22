// Types
export type Tag = {
  id: string;
  name: string;
  value: number;
  type: "variable" | "function";
};

export type TokenType = "tag" | "operator" | "number" | "text";

export type InputToken = {
  id: string;
  type: TokenType;
  value: string;
  tag?: Tag;
};

export interface FormulaState {
    tokens: InputToken[];
    cursorIndex: number;
    addToken: (token: InputToken, atIndex?: number) => void;
    removeToken: (id: string) => void;
    removeTokenAtIndex: (index: number) => void;
    updateToken: (id: string, value: string) => void;
    setCursorIndex: (index: number) => void;
    moveCursorLeft: () => void;
    moveCursorRight: () => void;
  }