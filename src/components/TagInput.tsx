'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    suggestions: string[];
    placeholder?: string;
    /** If true, only allows a single value (like team). Otherwise multi-select (like tags). */
    singleValue?: boolean;
}

export default function TagInput({
    values,
    onChange,
    suggestions,
    placeholder = 'Type to add...',
    singleValue = false,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter suggestions based on input, excluding what's already selected
    const filteredSuggestions = inputValue.trim()
        ? suggestions.filter(
            (s) =>
                s.toLowerCase().includes(inputValue.toLowerCase()) &&
                !values.includes(s)
        )
        : suggestions.filter((s) => !values.includes(s));

    const exactMatch = suggestions.some(
        (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
    );

    const showCreateOption =
        inputValue.trim() &&
        !exactMatch &&
        !values.includes(inputValue.trim());

    const allOptions = [
        ...filteredSuggestions,
        ...(showCreateOption ? [`__create__${inputValue.trim()}`] : []),
    ];

    const addValue = useCallback(
        (val: string) => {
            const trimmed = val.trim();
            if (!trimmed) return;
            if (singleValue) {
                onChange([trimmed]);
            } else {
                if (!values.includes(trimmed)) {
                    onChange([...values, trimmed]);
                }
            }
            setInputValue('');
            setShowDropdown(false);
            setHighlightedIndex(-1);
        },
        [values, onChange, singleValue]
    );

    const removeValue = useCallback(
        (val: string) => {
            onChange(values.filter((v) => v !== val));
        },
        [values, onChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
                const option = allOptions[highlightedIndex];
                if (option.startsWith('__create__')) {
                    addValue(option.replace('__create__', ''));
                } else {
                    addValue(option);
                }
            } else if (inputValue.trim()) {
                addValue(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
            removeValue(values[values.length - 1]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < allOptions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : allOptions.length - 1
            );
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="tag-input-container" ref={containerRef}>
            <div
                className="tag-input-wrapper"
                onClick={() => inputRef.current?.focus()}
            >
                {values.map((val) => (
                    <span key={val} className="tag-input-chip">
                        {val}
                        <button
                            className="tag-input-chip-remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeValue(val);
                            }}
                        >
                            <X size={10} />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    className="tag-input-field"
                    type="text"
                    value={inputValue}
                    placeholder={values.length === 0 ? placeholder : ''}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowDropdown(true);
                        setHighlightedIndex(-1);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {showDropdown && allOptions.length > 0 && (
                <div className="tag-input-dropdown">
                    {filteredSuggestions.map((option, i) => (
                        <button
                            key={option}
                            className={`tag-input-dropdown-item ${i === highlightedIndex ? 'highlighted' : ''
                                }`}
                            onMouseEnter={() => setHighlightedIndex(i)}
                            onClick={() => addValue(option)}
                        >
                            {option}
                        </button>
                    ))}
                    {showCreateOption && (
                        <button
                            className={`tag-input-dropdown-item create-new ${filteredSuggestions.length === highlightedIndex
                                    ? 'highlighted'
                                    : ''
                                }`}
                            onMouseEnter={() =>
                                setHighlightedIndex(filteredSuggestions.length)
                            }
                            onClick={() => addValue(inputValue.trim())}
                        >
                            <span className="tag-create-label">Create</span>
                            <span className="tag-create-value">
                                "{inputValue.trim()}"
                            </span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
