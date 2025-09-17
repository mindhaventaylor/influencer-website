import React from 'react';

const MessageFormatter = ({ content }) => {
  if (!content) return null;

  // Function to format text with markdown-like syntax
  const formatText = (text) => {
    // Split text into lines first to handle line breaks
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Process each line for formatting
      const parts = [];
      let currentIndex = 0;
      
      // Regular expressions for different formatting
      const patterns = [
        { regex: /\*\*(.*?)\*\*/g, component: 'bold' },      // **bold**
        { regex: /\*(.*?)\*/g, component: 'italic' },        // *italic*
        { regex: /`(.*?)`/g, component: 'code' },            // `code`
        { regex: /~~(.*?)~~/g, component: 'strikethrough' }, // ~~strikethrough~~
      ];
      
      // Find all matches for all patterns
      const allMatches = [];
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            content: match[1],
            type: pattern.component,
            fullMatch: match[0]
          });
        }
      });
      
      // Sort matches by start position
      allMatches.sort((a, b) => a.start - b.start);
      
      // Remove overlapping matches (keep the first one)
      const validMatches = [];
      for (let i = 0; i < allMatches.length; i++) {
        const current = allMatches[i];
        const hasOverlap = validMatches.some(existing => 
          (current.start < existing.end && current.end > existing.start)
        );
        if (!hasOverlap) {
          validMatches.push(current);
        }
      }
      
      // Build the formatted line
      validMatches.forEach((match, index) => {
        // Add text before the match
        if (currentIndex < match.start) {
          const beforeText = line.slice(currentIndex, match.start);
          if (beforeText) {
            parts.push(<span key={`text-${lineIndex}-${index}`}>{beforeText}</span>);
          }
        }
        
        // Add the formatted match
        const key = `${match.type}-${lineIndex}-${index}`;
        switch (match.type) {
          case 'bold':
            parts.push(<strong key={key} className="font-bold">{match.content}</strong>);
            break;
          case 'italic':
            parts.push(<em key={key} className="italic">{match.content}</em>);
            break;
          case 'code':
            parts.push(
              <code key={key} className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
                {match.content}
              </code>
            );
            break;
          case 'strikethrough':
            parts.push(<del key={key} className="line-through">{match.content}</del>);
            break;
          default:
            parts.push(<span key={key}>{match.content}</span>);
        }
        
        currentIndex = match.end;
      });
      
      // Add remaining text after the last match
      if (currentIndex < line.length) {
        const remainingText = line.slice(currentIndex);
        if (remainingText) {
          parts.push(<span key={`text-${lineIndex}-end`}>{remainingText}</span>);
        }
      }
      
      // If no matches found, return the original line
      if (parts.length === 0) {
        parts.push(<span key={`text-${lineIndex}`}>{line}</span>);
      }
      
      // Return the line with proper line break handling
      return (
        <div key={`line-${lineIndex}`} className={lineIndex > 0 ? 'mt-2' : ''}>
          {parts}
        </div>
      );
    });
  };

  return (
    <div className="whitespace-pre-wrap break-words">
      {formatText(content)}
    </div>
  );
};

export default MessageFormatter;
