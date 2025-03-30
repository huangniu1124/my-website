// 文件头部声明和导入
// 声明这是一个客户端组件，允许使用 React hooks 和交互功能
'use client';

// 导入 React 的 use State 钩子 用于状态管理
import { useState } from 'react';
import { sendMessage, Message } from './services/api';
import MarkdownRenderer from './components/MarkdownRenderer';

// 定义主组件 Home
export default function Home() {
  // 组件状态定义
  // 定义消息数组状态，每条消息包含类型（用户/AI）和内容
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  // 定义输入框状态，用于存储用户输入的内容
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 定义表单提交事件处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    // 阻止表单默认提交行为 防止页面刷新    
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // 转换消息格式为 DeepSeek API 需要的格式
      const apiMessages: Message[] = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // 添加当前用户消息
      apiMessages.push({
        role: 'user',
        content: userMessage
      });

      // 调用 API
      const response = await sendMessage(apiMessages);
      
      // 添加 AI 响应
      setMessages(prev => [...prev, {
        type: 'ai',
        content: response.content
      }]);
    } catch (error) {
      // 添加错误消息
      setMessages(prev => [...prev, {
        type: 'ai',
        content: '抱歉，发生了一些错误。请稍后重试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 返回组件的 UI 结构 
  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* 顶部导航栏 */}
      <nav className="glass-effect rounded-full p-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">AI Chat</h1>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              登录
            </button>
            <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:opacity-90 transition-opacity">
              开始对话
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      {/*条件渲染：无消息时显示欢迎界面，有消息时显示对话内容
          使用 map 函数渲染所有消息
          根据消息类型应用不同样式 */}
      <div className="max-w-4xl mx-auto">
        {/* 聊天容器 */}
        <div className="glass-effect rounded-2xl p-6 mb-6 chat-container">
          {messages.length === 0 ? (
            // 如果消息数组为空，显示欢迎信息   
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold mb-4 gradient-text">欢迎使用 AI Chat</h2>
              <p className="text-gray-400 max-w-md">
                这是一个智能的 AI 助手，可以帮助你解答问题、编写代码、分析数据等。
                开始对话吧！
              </p>
            </div>
          ) : ( 
            // 如果消息数组不为空，显示消息列表   
            <div className="space-y-4">
              {messages.map((message, index) => (
                // 根据消息类型，显示不同的样式 
                <div
                  key={index}
                  className={`message-bubble ${
                    message.type === 'user' ? 'user-message' : 'ai-message'
                  }`}
                > 
                  {/* 显示消息内容 */}
                  {message.type === 'ai' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="message-bubble ai-message">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
