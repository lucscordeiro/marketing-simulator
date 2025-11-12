import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/api';
import '../../styles/AIChat.css';

function AIChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.chatWithAgent(
        projectId, 
        inputMessage, 
        messages
      );

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "How can I improve my campaign CTR?",
    "What's the best channel for my budget?",
    "How to predict ROI for the next campaign?",
    "What insights can I extract from my data?",
    "How to optimize my marketing budget?"
  ];

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content.split('\n').map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="header-text">
            <h3>AI Marketing Assistant</h3>
            <p>Ask questions about your data and campaigns</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            className="clear-chat-btn"
            onClick={clearChat}
            title="Clear conversation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="welcome-message">
              <div className="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h4>Hello! I'm your AI Marketing Assistant</h4>
              <p>I can help you with:</p>
              <div className="capabilities-grid">
                <div className="capability-item">
                  <div className="capability-icon">📊</div>
                  <div className="capability-text">
                    <strong>Data Analysis</strong>
                    <span>Deep insights from your marketing data</span>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">🎯</div>
                  <div className="capability-text">
                    <strong>Campaign Optimization</strong>
                    <span>Improve performance and ROI</span>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">🔮</div>
                  <div className="capability-text">
                    <strong>Performance Predictions</strong>
                    <span>Forecast campaign results</span>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">💡</div>
                  <div className="capability-text">
                    <strong>Strategic Insights</strong>
                    <span>Data-driven recommendations</span>
                  </div>
                </div>
              </div>
              
              <div className="suggested-questions">
                <p className="suggestions-title">Try asking me:</p>
                <div className="suggestions-grid">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? (
                    <div className="avatar user-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="avatar ai-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2a10 10 0 0 1 7.38 16.75A10 10 0 0 1 12 2z"/>
                        <path d="M12 8v4l2 2"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">
                      {message.role === 'user' ? 'You' : 'Marketing AI'}
                    </span>
                    <span className="timestamp">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="message-text">
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              <div className="avatar ai-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2a10 10 0 0 1 7.38 16.75A10 10 0 0 1 12 2z"/>
                  <path d="M12 8v4l2 2"/>
                </svg>
              </div>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">Marketing AI</span>
              </div>
              <div className="message-text typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Thinking...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="input-container">
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your marketing data, campaigns, or predictions..."
              disabled={isLoading}
              rows="1"
              className="chat-textarea"
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
              title="Send message"
            >
              {isLoading ? (
                <div className="button-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </form>
    </div>
  );
}

export default AIChat;