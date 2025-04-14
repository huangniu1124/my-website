'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StyleProvider } from '@ant-design/cssinjs';
import './lib/antd-patch'; // 修正路径

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider 
        locale={zhCN}
        theme={{
          hashed: false, // 解决 React 兼容性问题
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
} 