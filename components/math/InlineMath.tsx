import React from "react";
import katex from "katex";

interface InlineMathProps {
  math: string;
  className?: string;
}

export function InlineMath({ math, className = "" }: InlineMathProps) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        output: "html",
      });
    } catch {
      return math;
    }
  }, [math]);

  return (
    <span
      className={`inline-math font-normal ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
