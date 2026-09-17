import React from "react";
import { InlineMath } from "./InlineMath";

interface MathTextProps {
  text: string;
  className?: string;
}

// Regex to capture LaTeX formulas: \frac{...}{...} sequences and $...$ expressions
const MATH_PATTERN =
  /(\$(?:\\\$|[^$])+\$|\\frac\{[^{}]+\}\{[^{}]+\}(?:\s*[\+\-\*\/=]\s*(?:\\frac\{[^{}]+\}\{[^{}]+\}|\d+))*)/g;

export function MathText({ text, className = "" }: MathTextProps) {
  if (!text) return null;

  // Split text by the math pattern while keeping delimiters
  const parts = text.split(MATH_PATTERN);

  return (
    <span className={`math-text-container leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // If part is wrapped in $, render as inline math
        if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
          const expression = part.slice(1, -1);
          return <InlineMath key={index} math={expression} />;
        }

        // If part contains LaTeX macros like \frac
        if (part.includes("\\frac") || part.includes("\\times") || part.includes("\\div")) {
          return <InlineMath key={index} math={part} />;
        }

        // Standard text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
