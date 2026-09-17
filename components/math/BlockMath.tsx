import React from "react";
import katex from "katex";

interface BlockMathProps {
  math: string;
  className?: string;
}

export function BlockMath({ math, className = "" }: BlockMathProps) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        output: "html",
      });
    } catch {
      return math;
    }
  }, [math]);

  return (
    <div
      className={`block-math my-2 flex justify-center overflow-x-auto py-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
