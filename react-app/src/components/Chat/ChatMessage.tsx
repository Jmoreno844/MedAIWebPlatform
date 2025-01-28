import { Message } from "../../types/chat";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { FC, memo } from "react";

interface ChatMessageProps {
  message: Message;
}

/**
 * ChatMessage component that renders user and assistant messages with markdown support
 * Includes XSS protection and accessible styling
 */
export const ChatMessage: FC<ChatMessageProps> = memo(({ message }) => {
  const isUser = message.role === "user";

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param content - The content to be sanitized
   */
  const sanitizeContent = (content: string): string => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "u",
        "sup",
        "sub",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: [], // No attributes allowed for security
    });
  };

  // Custom components for markdown rendering
  const markdownComponents: Components = {
    // Secure code block rendering
    code: ({ node, className, children, ...props }) => {
      return (
        <code
          className={`bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm ${
            className || ""
          }`}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Secure pre block rendering for code blocks
    pre: ({ node, children, ...props }) => (
      <pre
        className="bg-gray-200 dark:bg-gray-700 rounded p-3 my-2 overflow-x-auto"
        {...props}
      >
        {children}
      </pre>
    ),

    // Secure list rendering
    ul: ({ node, children, ...props }) => (
      <ul className="list-disc list-inside my-2 space-y-1" {...props}>
        {children}
      </ul>
    ),

    // Secure ordered list rendering
    ol: ({ node, children, ...props }) => (
      <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
        {children}
      </ol>
    ),

    // Paragraphs with proper spacing
    p: ({ node, children, ...props }) => (
      <p className="my-2" {...props}>
        {children}
      </p>
    ),
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 animate-fadeIn`}
      role="listitem"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {/* Apply markdown formatting with security measures */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            className="markdown-content"
          >
            {sanitizeContent(message.content)}
          </ReactMarkdown>
        </div>
        <time
          dateTime={message.timestamp.toISOString()}
          className="text-xs opacity-50 mt-2 block"
        >
          {format(message.timestamp, "HH:mm")}
        </time>
      </div>
    </div>
  );
});

// Add display name for debugging purposes
ChatMessage.displayName = "ChatMessage";
