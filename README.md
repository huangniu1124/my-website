# AI 聊天助手

这是一个基于 Next.js 和 DeepSeek API 构建的现代化 AI 聊天应用。该应用具有优雅的用户界面和流畅的交互体验，支持 Markdown 格式的消息渲染。

## 功能特点

- 💬 实时 AI 对话
- 🎨 现代化 UI 设计

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- React Markdown
- DeepSeek API

## 开始使用

1. 克隆项目
```bash
git clone [项目地址]
cd my-website
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件并添加以下内容：
```
DEEPSEEK_API_KEY=你的API密钥
```

4. 启动开发服务器
```bash
npm run dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
my-website/
├── app/
│   ├── components/
│   │   └── MarkdownRenderer.tsx  # Markdown 渲染组件
│   ├── services/
│   │   └── api.ts               # API 服务
│   ├── page.tsx                 # 主页面
│   └── globals.css              # 全局样式
├── public/                      # 静态资源
└── package.json                 # 项目配置
```

## 使用说明

1. 在输入框中输入您的问题
2. 点击发送按钮或按回车键
3. 等待 AI 响应
4. 支持 Markdown 格式的回复会自动渲染

## 开发说明

- 使用 `npm run dev` 启动开发服务器
- 使用 `npm run build` 构建生产版本
- 使用 `npm run start` 启动生产服务器
- 使用 `npm run lint` 运行代码检查

## 注意事项

- 请确保 API 密钥的安全性
- 建议在生产环境中使用环境变量
- 注意 API 调用限制和费用

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
