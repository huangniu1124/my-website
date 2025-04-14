import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';

export default function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        // 关闭哈希模式以解决兼容性问题
        hashed: false,
        // 其他主题配置可以在这里添加
      }}
    >
      {children}
    </ConfigProvider>
  );
} 