/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export function MarkdownView({ content }: MarkdownViewProps) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed text-slate-705 dark:text-slate-200">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        // 1. Headers
        if (trimmed.startsWith('### ')) {
          const text = trimmed.substring(4);
          return (
            <h4 key={idx} className="text-base md:text-lg font-black text-orange-600 dark:text-orange-500 mt-4 mb-2 flex items-center gap-2 font-display">
              {renderInlineBold(text)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          const text = trimmed.substring(3);
          return (
            <h3 key={idx} className="text-lg md:text-xl font-black text-orange-700 dark:text-orange-400 mt-5 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1 font-display">
              {renderInlineBold(text)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          const text = trimmed.substring(2);
          return (
            <h2 key={idx} className="text-xl md:text-2xl font-black text-orange-850 dark:text-orange-300 mt-6 mb-4 font-display">
              {renderInlineBold(text)}
            </h2>
          );
        }

        // 2. Unordered lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-4 my-1.5 font-sans">
              <span className="text-orange-500 dark:text-orange-400 mt-1.5 text-xs animate-pulse">•</span>
              <span className="flex-1 text-slate-700 dark:text-slate-250">{renderInlineBold(text)}</span>
            </div>
          );
        }

        // 3. Blockquotes
        if (trimmed.startsWith('> ')) {
          const text = trimmed.substring(2);
          return (
            <blockquote key={idx} className="border-l-4 border-orange-500 dark:border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 px-4 py-2 my-3 rounded-r-md italic text-slate-800 dark:text-slate-200 font-sans">
              {renderInlineBold(text)}
            </blockquote>
          );
        }

        // 4. Empty line
        if (trimmed === '') {
          return <div key={idx} className="h-2" />;
        }

        // 5. Normal paragraphs
        return (
          <p key={idx} className="text-slate-700 dark:text-slate-250 leading-relaxed my-1 font-sans">
            {renderInlineBold(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Basic inline parsing of bold text (**bold**)
 */
function renderInlineBold(text: string): React.ReactNode {
  // Regex to match **text**
  const regex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-extrabold text-slate-905 dark:text-white">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
