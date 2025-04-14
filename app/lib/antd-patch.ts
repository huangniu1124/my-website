'use client';

import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

// 为 React 18 设置渲染方法
unstableSetRender((node, container) => {
  // 使用类型断言解决 TypeScript 错误
  const containerWithRoot = container as Element & { _reactRoot?: ReturnType<typeof createRoot> };
  
  containerWithRoot._reactRoot ||= createRoot(container);
  const root = containerWithRoot._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
}); 