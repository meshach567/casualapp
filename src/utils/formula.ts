import { InputToken } from "../types/casual";

// Utility functions
export const isOperator = (char: string): boolean => {
    return ['+', '-', '*', '/', '(', ')', '^', '='].includes(char);
  };
  
  export const isDigit = (char: string): boolean => {
    return /^\d$/.test(char);
  };
  
  export const evaluateFormula = (tokens: InputToken[]): number => {
    try {
      let formula = '';
      
      tokens.forEach(token => {
        if (token.type === 'tag' && token.tag) {
          formula += token.tag.value;
        } else {
          formula += token.value;
        }
      });
      
      // Basic validation
      if (!formula.trim()) return 0;
      
      // For demo purposes only - in production, use a proper math parser
      // eslint-disable-next-line no-eval
      return eval(formula);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  };
  