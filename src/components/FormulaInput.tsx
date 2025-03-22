import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useFormulaStore } from "../hooks/useFormulaStore";
import { useAutocompleteQuery } from "../pages/api/useAutocompleteQuery";
import { Tag, TokenType } from "../types/casual";
import { evaluateFormula } from "../utils/formula";

const FormulaInput: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [activeTagDropdown, setActiveTagDropdown] = useState<string | null>(null);
    const [result, setResult] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const { 
      tokens, 
      cursorIndex, 
      addToken, 
      removeToken, 
      removeTokenAtIndex,
      setCursorIndex,
      moveCursorLeft,
      moveCursorRight
    } = useFormulaStore();
    
    const { data: suggestions = [], isLoading } = useAutocompleteQuery(inputValue);
  
    // Focus input when component mounts
    useEffect(() => {
      inputRef.current?.focus();
    }, []);
  
    // Keep focus on input when clicking container
    useEffect(() => {
      const handleContainerClick = () => {
        inputRef.current?.focus();
      };
      
      const container = containerRef.current;
      container?.addEventListener('click', handleContainerClick);
      return () => {
        container?.removeEventListener('click', handleContainerClick);
      };
    }, []);
    
    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setShowSuggestions(value.length > 0);
      setSelectedSuggestionIndex(0);
      setErrorMessage(null);
    };
  
    // Add a tag
    const addTagToken = (suggestion: { id?: string; name: string; value?: number; type?: string }) => {
      const newTag: Tag = {
        id: suggestion.id || `tag-${Date.now()}`,
        name: suggestion.name,
        value: suggestion.value !== undefined ? suggestion.value : Math.floor(Math.random() * 100),
        type: suggestion.type === 'function' ? 'function' : 'variable',
      };
      
      addToken({
        id: `token-${Date.now()}`,
        type: 'tag',
        value: suggestion.name,
        tag: newTag,
      });
      
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    };
    
    // Add operator or number
    const addOperatorOrNumberToken = (value: string, type: 'operator' | 'number' | 'text') => {
      addToken({
        id: `token-${Date.now()}`,
        type,
        value,
      });
      
      setInputValue('');
      inputRef.current?.focus();
    };
    
    // Handle keydown in input
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Reset error on any keystroke
      setErrorMessage(null);
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (suggestions.length > 0 && showSuggestions) {
            addTagToken(suggestions[selectedSuggestionIndex]);
          } else if (inputValue.trim()) {
            // Check if input is a number
            if (/^\d+(\.\d+)?$/.test(inputValue)) {
              addOperatorOrNumberToken(inputValue, 'number');
            } else {
              addOperatorOrNumberToken(inputValue, 'text');
            }
          }
          break;
          
        case 'Backspace':
          if (inputValue === '') {
            e.preventDefault();
            if (cursorIndex > 0) {
              removeTokenAtIndex(cursorIndex - 1);
            }
          }
          break;
          
        case 'ArrowUp':
          if (showSuggestions && suggestions.length > 0) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
          }
          break;
          
        case 'ArrowDown':
          if (showSuggestions && suggestions.length > 0) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
          }
          break;
          
        case 'ArrowLeft':
          if (inputValue === '') {
            e.preventDefault();
            moveCursorLeft();
          }
          break;
          
        case 'ArrowRight':
          if (inputValue === '') {
            e.preventDefault();
            moveCursorRight();
          }
          break;
          
        case 'Tab':
          if (showSuggestions && suggestions.length > 0) {
            e.preventDefault();
            addTagToken(suggestions[selectedSuggestionIndex]);
          }
          break;
          
        case '+':
        case '-':
        case '*':
        case '/':
        case '(':
        case ')':
        case '^':
        case '=':
          e.preventDefault();
          if (inputValue.trim()) {
            // First add the current input
            if (/^\d+(\.\d+)?$/.test(inputValue)) {
              addOperatorOrNumberToken(inputValue, 'number');
            } else {
              addOperatorOrNumberToken(inputValue, 'text');
            }
          }
          // Then add the operator
          addOperatorOrNumberToken(e.key, 'operator');
          break;
          
        default:
          // For numbers and regular typing, do nothing special
          break;
      }
    };
    
    // Toggle tag dropdown
    const toggleTagDropdown = (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent container click from firing
      setActiveTagDropdown(prev => prev === id ? null : id);
    };
    
    // Handle tag option selection
    const handleTagOption = (action: string, tagId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent container click from firing
      
      switch (action) {
        case 'remove':
          removeToken(tagId);
          break;
        case 'edit':
          // For demo, just show a message
          setErrorMessage('Edit functionality would open a modal to edit the tag');
          break;
        default:
          break;
      }
      
      setActiveTagDropdown(null);
    };
    
    // Set cursor position by clicking
    const handleSetCursorPosition = (index: number) => {
      setCursorIndex(index);
      inputRef.current?.focus();
    };
    
    // Calculate formula result
    const calculateResult = () => {
      try {
        const calculatedResult = evaluateFormula(tokens);
        setResult(calculatedResult);
        setErrorMessage(null);
      } catch {
        setErrorMessage('Error calculating formula. Please check your syntax.');
        setResult(null);
      }
    };
    
    // Generate token class based on type
    const getTokenClass = (type: TokenType) => {
      switch (type) {
        case 'tag':
          return 'bg-blue-100 text-blue-800 rounded px-2 py-1 flex items-center';
        case 'operator':
          return 'mx-1 text-gray-700 font-bold';
        case 'number':
          return 'text-green-700';
        default:
          return '';
      }
    };
  
    return (
      <div className="w-full">
        {/* Formula Input Container */}
        <div 
          ref={containerRef}
          className="border border-gray-300 rounded-md p-2 flex flex-wrap items-center min-h-12 bg-white relative"
        >
          {/* Tokens before cursor */}
          {tokens.slice(0, cursorIndex).map((token, index) => (
            <div key={token.id} className="flex items-center mx-1">
              <div 
                className={getTokenClass(token.type)}
                onClick={() => handleSetCursorPosition(index)}
              >
                {token.value}
                
                {/* Dropdown for tags */}
                {token.type === 'tag' && (
                  <span 
                    className="ml-1 text-gray-500 cursor-pointer"
                    onClick={(e) => toggleTagDropdown(token.id, e)}
                  >
                    ▼
                  </span>
                )}
              </div>
              
              {/* Tag dropdown menu */}
              {token.type === 'tag' && activeTagDropdown === token.id && (
                <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-48">
                  <div className="p-2 border-b">
                    <strong>Type:</strong> {token.tag?.type}
                  </div>
                  <div className="p-2 border-b">
                    <strong>Value:</strong> {token.tag?.value}
                  </div>
                  <div 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => handleTagOption('edit', token.id, e)}
                  >
                    Edit
                  </div>
                  <div 
                    className="p-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => handleTagOption('remove', token.id, e)}
                  >
                    Remove
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Input field */}
          <div className="relative inline-block">
            <input
              ref={inputRef}
              className="outline-none min-w-[4rem] w-auto px-1"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={cursorIndex === 0 && tokens.length === 0 ? "Type formula..." : ""}
            />
            
            {/* Cursor indicator */}
            {inputValue === '' && (
              <span className="absolute h-4 w-0.5 bg-blue-500 animate-pulse cursor-indicator"></span>
            )}
          </div>
          
          {/* Tokens after cursor */}
          {tokens.slice(cursorIndex).map((token, index) => (
            <div key={token.id} className="flex items-center mx-1">
              <div 
                className={getTokenClass(token.type)}
                onClick={() => handleSetCursorPosition(cursorIndex + index + 1)}
              >
                {token.value}
                
                {/* Dropdown for tags */}
                {token.type === 'tag' && (
                  <span 
                    className="ml-1 text-gray-500 cursor-pointer"
                    onClick={(e) => toggleTagDropdown(token.id, e)}
                  >
                    ▼
                  </span>
                )}
              </div>
              
              {/* Tag dropdown menu */}
              {token.type === 'tag' && activeTagDropdown === token.id && (
                <div className="absolute mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-48">
                  <div className="p-2 border-b">
                    <strong>Type:</strong> {token.tag?.type}
                  </div>
                  <div className="p-2 border-b">
                    <strong>Value:</strong> {token.tag?.value}
                  </div>
                  <div 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => handleTagOption('edit', token.id, e)}
                  >
                    Edit
                  </div>
                  <div 
                    className="p-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => handleTagOption('remove', token.id, e)}
                  >
                    Remove
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-1 border border-gray-300 rounded-md shadow-md bg-white max-h-64 overflow-y-auto absolute z-10">
            {suggestions.map((suggestion: { id?: string; name: string; description?: string; type?: string; value?: number }, index: number) => (
              <div
                key={suggestion.id || index}
                className={`p-2 cursor-pointer ${
                  index === selectedSuggestionIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => addTagToken(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                {suggestion.description && (
                  <div className="text-sm text-gray-600">{suggestion.description}</div>
                )}
                <div className="text-xs text-gray-500">
                  {suggestion.type || 'variable'} • {suggestion.value !== undefined ? suggestion.value : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && inputValue && (
          <div className="mt-1 p-2 text-gray-500">
            Loading suggestions...
          </div>
        )}
        
        {/* Error message */}
        {errorMessage && (
          <div className="mt-2 text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
        
        {/* Calculate button and result */}
        <div className="mt-4 flex justify-between items-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={calculateResult}
          >
            Calculate
          </button>
          
          {result !== null && (
            <div className="text-2xl font-bold">
              = {result}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default FormulaInput;