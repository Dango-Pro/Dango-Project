import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { api } from '../libs/api';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  // const { t } = useTranslation();
  const { i18n } = useTranslation(); // Use i18n to get current language
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '안녕하세요! 학습 관리 도우미입니다. 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message and current language
      const { data } = await api.post('/chat', { 
        message: userMessage.content,
        language: i18n.language 
      });
      const aiMessage: ChatMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>AI 학습 도우미</h1>
        
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          {/* Chat Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#d9534f' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                  maxWidth: '70%',
                  boxShadow: msg.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid #eee' : 'none',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#fff',
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 0',
                border: '1px solid #eee',
                color: '#888'
              }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '15px',
            backgroundColor: '#fff',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 내용을 물어보세요..."
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '24px',
                border: '1px solid #ddd',
                outline: 'none',
                fontSize: '1em'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: '#d9534f',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                padding: '0 24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: (isLoading || !input.trim()) ? 0.6 : 1
              }}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
