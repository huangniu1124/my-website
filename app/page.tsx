'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Spin, Avatar, Layout, Typography, Divider, Dropdown, Tooltip, theme, Modal, List } from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined, 
  LogoutOutlined, 
  DeleteOutlined, 
  UndoOutlined, 
  MoreOutlined,
  MenuOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { logger } from './utils/logger';
import { sendMessage, Message as ApiMessage } from './services/api';
import MarkdownRenderer from './components/MarkdownRenderer';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: Date;
}

// 新的对话历史模型
interface ChatSession {
  id: string;           // 会话唯一ID
  startTime: Date;      // 会话开始时间
  endTime: Date;        // 会话结束时间
  messages: Message[];  // 会话包含的消息
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<Message[][]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const { token } = theme.useToken();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'warning' | 'expired'>('active');
  const WARNING_TIMEOUT = 9 * 60 * 1000; // 9分钟，在超时前1分钟显示警告

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10分钟，单位为毫秒
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    // 重置会话状态
    setSessionStatus('active');
    
    // 清除现有的计时器
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // 设置警告计时器
    const warningTimer = setTimeout(() => {
      setSessionStatus('warning');
    }, WARNING_TIMEOUT);
    
    // 设置超时计时器
    inactivityTimerRef.current = setTimeout(() => {
      setSessionStatus('expired');
      
      // 保存当前会话
      saveCurrentSessionToHistory();
      
      // 显示提示消息
      alert('由于长时间未操作，会话已断开，请重新登录。');
      
      // 清除用户信息并重定向到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }, INACTIVITY_TIMEOUT);
    
    // 返回清理函数
    return () => {
      clearTimeout(warningTimer);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [router]);

  useEffect(() => {
    resetInactivityTimer();
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetInactivityTimer();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  // 改进滚动到底部功能
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      try {
        // 尝试使用标准方法
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      } catch (error) {
        // 降级方案：使用直接滚动
        const container = messagesEndRef.current.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  };

  // 在更多的场景中触发滚动
  useEffect(() => {
    // 每当消息变化时滚动到底部
    scrollToBottom();
  }, [messages]);

  // 在加载状态变化时也触发滚动
  useEffect(() => {
    if (loading) {
      // 当开始加载时滚动到底部，确保用户可以看到加载提示
      setTimeout(scrollToBottom, 100);
    }
  }, [loading]);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('加载的用户信息:', parsedUser); // 调试输出
        setUser(parsedUser);
      } catch (e) {
        logger.error('解析用户信息失败', undefined, { error: e });
      }
    } else {
      // 如果没有用户信息，重定向到登录页
      router.push('/login');
      return;
    }

    // 添加欢迎消息
    setMessages([
      {
        id: '1',
        content: '你好！我是 AI 助手，有什么我可以帮助你的吗？',
        role: 'ai',
        timestamp: new Date(),
      },
    ]);

    // 从 localStorage 获取历史对话
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      try {
        setMessageHistory(JSON.parse(storedHistory));
      } catch (e) {
        logger.error('解析历史对话失败', undefined, { error: e });
      }
    }
  }, [router]);

  // 保存历史对话到 localStorage
  useEffect(() => {
    if (messageHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
    }
  }, [messageHistory]);

  // 保存当前会话到历史记录
  const saveCurrentSessionToHistory = () => {
    if (messages.length <= 1) return; // 不保存只有欢迎消息的状态
    
    // 确保所有消息的时间戳都是日期对象
    const normalizedMessages = messages.map(msg => ({
      ...msg,
      timestamp: typeof msg.timestamp === 'string' 
        ? new Date(msg.timestamp) 
        : msg.timestamp
    }));
    
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(normalizedMessages[0].timestamp),
      endTime: new Date(),
      messages: normalizedMessages
    };
    
    setChatHistory(prev => [...prev, newSession]);
  };

  // 修改清空对话的方法
  const handleClearChat = () => {
    resetInactivityTimer();
    
    // 保存当前对话到历史
    saveCurrentSessionToHistory();
    
    // 重置为只有欢迎消息
    setMessages([
      {
        id: Date.now().toString(),
        content: '你好！我是 AI 助手，有什么我可以帮助你的吗？',
        role: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  // 修改退出登录的方法
  const handleLogout = () => {
    resetInactivityTimer();
    saveCurrentSessionToHistory(); // 保存当前会话
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // 保存聊天历史到 localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // 加载聊天历史
  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
      } catch (e) {
        logger.error('解析历史对话失败', undefined, { error: e });
      }
    }
  }, []);

  const handleSend = async () => {
    resetInactivityTimer();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // 发送消息后立即滚动到底部
    setTimeout(scrollToBottom, 50);
    
    setLoading(true);
    
    try {
      // 转换消息格式以适应 API
      const apiMessages: ApiMessage[] = messages.concat(userMessage).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // 调用 API
      const response = await sendMessage(apiMessages);
      
      // 调试输出
      console.log('API 响应:', response);
      
      // 安全地访问响应数据
      let aiContent = '抱歉，我无法回答这个问题。';
      
      // 尝试不同的响应格式
      if (response) {
        if (response.content) {
          // 直接格式: { role: 'assistant', content: '...' }
          aiContent = response.content;
        } else if (response.choices && 
                   Array.isArray(response.choices) && 
                   response.choices.length > 0) {
          // OpenAI 格式: { choices: [{ message: { content: '...' } }] }
          if (response.choices[0].message && response.choices[0].message.content) {
            aiContent = response.choices[0].message.content;
          } else if (response.choices[0].content) {
            // 简化格式: { choices: [{ content: '...' }] }
            aiContent = response.choices[0].content;
          }
        }
      }
      
      // 处理 API 响应
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        role: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // 处理 API 响应后再次滚动到底部
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error('API 错误:', error);
      logger.error('发送消息失败', undefined, { error });
      // 显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发生了错误，请稍后再试。',
        role: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // 处理错误后也滚动到底部
      setTimeout(scrollToBottom, 50);
    } finally {
      setLoading(false);
      // 加载完成后确保一次最终的滚动
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewHistory = () => {
    resetInactivityTimer();
    
    if (chatHistory.length === 0) {
      // 如果没有历史记录，显示提示
      setMessages([
        {
          id: `no-history-${Date.now()}`,
          content: '暂无历史对话记录',
          role: 'ai',
          timestamp: new Date(),
        },
        ...messages
      ]);
      return;
    }
    
    // 创建一个包含所有历史消息的数组
    let allMessages: Message[] = [];
    
    // 添加一个分隔消息，表示开始显示历史记录
    allMessages.push({
      id: `history-start-${Date.now()}`,
      content: '--- 以下是历史对话记录 ---',
      role: 'ai',
      timestamp: new Date(),
    });
    
    // 按时间排序历史会话（从早到晚）
    const sortedHistory = [...chatHistory].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // 遍历排序后的历史记录
    for (let i = 0; i < sortedHistory.length; i++) {
      const session = sortedHistory[i];
      
      // 添加会话时间标记
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      
      allMessages.push({
        id: `session-${i}-time-${Date.now()}`,
        content: `--- 对话 ${i+1}: ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()} 至 ${endTime.toLocaleTimeString()} ---`,
        role: 'ai',
        timestamp: startTime,
      });
      
      // 添加会话中的所有消息
      allMessages = allMessages.concat(session.messages);
    }
    
    // 添加一个分隔消息，表示历史记录结束
    allMessages.push({
      id: `history-end-${Date.now()}`,
      content: '--- 历史对话记录结束，以下是当前对话 ---',
      role: 'ai',
      timestamp: new Date(),
    });
    
    // 将所有消息设置到当前对话中显示
    setMessages(allMessages.concat(messages));
    
    // 使用多次延迟滚动，确保在所有消息渲染完成后滚动到底部
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 300);
    setTimeout(scrollToBottom, 500);
  };

  // 添加一个去重功能，可以在组件中添加一个按钮或在适当的时机调用
  const removeDuplicateHistory = () => {
    // 使用消息ID字符串作为标识
    const uniqueHistorySets = new Map<string, Message[]>();
    
    messageHistory.forEach(history => {
      // 为每段历史创建唯一标识
      const historyKey = history.map(msg => msg.id).sort().join(',');
      
      // 如果这个标识不存在，或者现有的历史记录条数少于当前的，则替换
      if (!uniqueHistorySets.has(historyKey) || 
          uniqueHistorySets.get(historyKey)!.length < history.length) {
        uniqueHistorySets.set(historyKey, history);
      }
    });
    
    // 转换回数组
    const uniqueHistory = Array.from(uniqueHistorySets.values());
    
    // 更新历史记录
    setMessageHistory(uniqueHistory);
  };

  // 可以在应用启动时调用一次去重
  useEffect(() => {
    if (messageHistory.length > 0) {
      removeDuplicateHistory();
    }
  }, []);  // 仅在组件挂载时执行一次

  // 清除现有的历史记录
  const clearAllHistory = () => {
    localStorage.removeItem('chatHistory');
    setMessageHistory([]);  // 兼容旧代码
    setChatHistory([]);     // 新模型
  };

  // 在组件初始化时调用清除历史
  useEffect(() => {
    clearAllHistory();
  }, []);

  // 更多菜单
  const userMenuItems = [
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '查看历史对话',
      onClick: handleViewHistory,
    },
    {
      key: 'clearHistory',
      icon: <DeleteOutlined />,
      label: '清除所有历史',
      onClick: clearAllHistory,
    },
    {
      key: 'clear',
      icon: <DeleteOutlined />,
      label: '清空当前对话',
      onClick: handleClearChat,
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ height: '100vh', background: token.colorBgContainer }}>
      {/* Material Design 风格的 App Bar */}
      <Header style={{ 
        height: '64px', 
        background: '#4285F4', 
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: '12px',
            color: '#4285F4',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            AI
          </div>
          <Title level={4} style={{ margin: 0, color: 'white' }}>AI Chat</Title>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              style={{ color: 'white', fontSize: '20px' }}
            />
          </Dropdown>
          
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
            <Avatar 
              style={{ 
                backgroundColor: '#F4B400', // Google 黄色
                cursor: 'pointer' 
              }} 
              icon={<UserOutlined />} 
            />
            <Text style={{ margin: '0 12px', color: 'white', fontWeight: 500 }}>
              {user?.name || user?.email?.split('@')[0] || '用户'}
            </Text>
          </div>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '16px', 
          height: 'calc(100vh - 140px)', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}>
          {sessionStatus === 'warning' && (
            <div style={{
              backgroundColor: '#FFF3CD',
              color: '#856404',
              padding: '8px 16px',
              borderRadius: '4px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>您的会话即将在1分钟内过期。继续操作可保持会话活跃。</span>
              <Button 
                size="small" 
                onClick={resetInactivityTimer}
              >
                保持活跃
              </Button>
            </div>
          )}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              marginBottom: '16px',
              scrollBehavior: 'smooth',  // 添加平滑滚动行为
              display: 'flex',
              flexDirection: 'column'    // 确保消息垂直排列
            }}
          >
            <div style={{ flexGrow: 1 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ 
                    marginBottom: '16px', 
                    display: 'flex',
                    justifyContent: msg.id.includes('history-') ? 'center' : (msg.role === 'user' ? 'flex-end' : 'flex-start')
                  }}
                >
                  {msg.id.includes('history-') ? (
                    // 渲染时间分隔线
                    <div style={{ 
                      padding: '6px 12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#666',
                      textAlign: 'center',
                      maxWidth: '80%'
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    // 渲染正常对话消息
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      maxWidth: '80%'
                    }}>
                      <Avatar 
                        icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                        style={{ 
                          backgroundColor: msg.role === 'user' ? '#4285F4' : '#34A853', // Google 蓝色和绿色
                          marginLeft: msg.role === 'user' ? '8px' : 0,
                          marginRight: msg.role === 'user' ? 0 : '8px',
                          flexShrink: 0, // 防止Avatar被压缩
                          minWidth: '32px', // 确保最小宽度
                          minHeight: '32px', // 确保最小高度
                        }}
                        size={32} // 使用固定尺寸
                      />
                      <div style={{ 
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: msg.role === 'user' ? '#4285F4' : '#F1F3F4', // Google 蓝色和浅灰色
                        color: msg.role === 'user' ? 'white' : '#202124',
                        borderTopRightRadius: msg.role === 'user' ? 0 : '18px',
                        borderTopLeftRadius: msg.role === 'user' ? '18px' : 0,
                        position: 'relative',
                      }}>
                        {/* 显示消息时间 */}
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '-18px',
                          [msg.role === 'user' ? 'right' : 'left']: '8px',
                          fontSize: '10px',
                          color: '#999'
                        }}>
                          {new Date(
                            typeof msg.timestamp === 'string' 
                              ? new Date(msg.timestamp) 
                              : msg.timestamp
                          ).toLocaleTimeString()}
                        </div>
                        
                        {/* 对用户消息使用纯文本，对 AI 消息使用 Markdown 渲染 */}
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <MarkdownRenderer 
                            content={msg.content} 
                            className=""
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', maxWidth: '80%' }}>
                    <Avatar 
                      icon={<RobotOutlined />} 
                      style={{ 
                        backgroundColor: '#34A853', 
                        marginRight: '8px',
                        flexShrink: 0,
                        minWidth: '32px',
                        minHeight: '32px',
                      }}
                      size={32}
                    />
                    <div style={{ 
                      padding: '12px 16px', 
                      borderRadius: '18px', 
                      backgroundColor: '#F1F3F4',
                      color: '#202124',
                      borderTopLeftRadius: 0,
                    }}>
                      <Spin size="small" /> 思考中...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 明确的滚动目标元素 */}
            <div 
              ref={messagesEndRef} 
              style={{ 
                height: '1px', 
                margin: 0, 
                padding: 0,
                visibility: 'hidden'  // 隐藏但保持占位
              }} 
            />
          </div>
          
          <Divider style={{ margin: '8px 0' }} />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ 
                borderRadius: '24px', 
                marginRight: '12px',
                padding: '8px 16px',
                resize: 'none'
              }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{ 
                backgroundColor: '#4285F4', // Google 蓝色
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              }}
              size="large"
            />
          </div>
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        padding: '10px 50px',
        background: 'transparent',
        color: '#5F6368' // Google 灰色
      }}>
        AI Chat © {new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  );
}