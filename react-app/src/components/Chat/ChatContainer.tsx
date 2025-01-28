import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatState, MessageRole } from "../../types/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

// Constants
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 3;
const CONNECTION_TIMEOUT = 5000;

export const ChatContainer: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setChatState((prev) => ({
        ...prev,
        error:
          "Fallo al conectar despues de varios intentos. Porfavor refresce la pagina.",
      }));
      return;
    }

    // Close existing connection if any
    cleanup();

    try {
      const WS_URL = `${process.env.REACT_APP_WS_URL}/ws/chat`;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        setChatState((prev) => ({ ...prev, error: null }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setChatState((prev) => ({
              ...prev,
              error: data.error,
              isLoading: false,
            }));
            return;
          }

          // Real-time streaming update
          setChatState((prev) => {
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];

            // If there's a streaming message in progress
            if (lastMessage?.role === MessageRole.ASSISTANT && !data.done) {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + (data.chunk || ""),
              };
            } else if (data.chunk) {
              // Start new assistant message
              messages.push({
                id: uuidv4(),
                content: data.chunk,
                role: MessageRole.ASSISTANT,
                timestamp: new Date(),
              });
            }

            return {
              ...prev,
              messages,
              isLoading: !data.done,
              error: null,
            };
          });
        } catch (error) {
          console.error("WebSocket message parsing error:", error);
        }
      };

      ws.onclose = (event) => {
        if (!event.wasClean && isConnected) {
          setIsConnected(false);
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(
            connectWebSocket,
            RECONNECT_DELAY
          );
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
        setChatState((prev) => ({
          ...prev,
          error: "Connection error. Attempting to reconnect...",
          isLoading: false,
        }));
      };

      // Set connection timeout
      const timeoutId = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setIsConnected(false);
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(
            connectWebSocket,
            RECONNECT_DELAY
          );
        }
      }, CONNECTION_TIMEOUT);

      connectionTimeoutRef.current = timeoutId;
    } catch (error) {
      setIsConnected(false);
      console.error("WebSocket connection error:", error);
    }
  }, [isConnected]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      // Only close if connection is open or connecting
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
  }, []);

  // Setup effect with proper dependencies
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      connectWebSocket();
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [connectWebSocket, cleanup]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setChatState((prev) => ({
        ...prev,
        error: "Connection lost. Please refresh the page.",
      }));
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      role: MessageRole.USER,
      timestamp: new Date(),
    };

    // Format history for Gemini API
    const formattedHistory = chatState.messages.map(({ content, role }) => ({
      parts: [{ text: content }],
      role: role === MessageRole.USER ? "user" : "model",
    }));

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    wsRef.current.send(
      JSON.stringify({
        message: content.trim(),
        history: formattedHistory,
      })
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-bold">Conectando...</p>
          <p>Intentando establecer conexion...</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {chatState.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <h2 className="text-3xl font-bold mb-2">¿Cómo puedo ayudarte?</h2>
              <p className="text-lg w-3/4 mx-auto pt-1">
                Puedo responder preguntas basadas en literatura médica
                actualizada, generar recomendaciones generales y ayudarte a
                explorar temas clínicos.
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </>
        )}
        {chatState.isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-pulse flex space-x-4">
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        )}
        {chatState.error && (
          <div className="text-red-500 text-center py-2">{chatState.error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={chatState.isLoading || !isConnected}
      />
    </div>
  );
};
