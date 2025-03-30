import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Options } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const options: Options = {
    remarkPlugins: [remarkGfm],
    components: {
      code: (props: any) => {
        const match = /language-(\w+)/.exec(props.className || '');
        return !props.inline && match ? (
          <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <code className={props.className} {...props}>
              {props.children}
            </code>
          </pre>
        ) : (
          <code className="bg-gray-800 rounded px-1 py-0.5" {...props}>
            {props.children}
          </code>
        );
      },
      // 自定义链接样式
      a({ node, children, ...props }) {
        return (
          <a
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
      // 自定义标题样式
      h1({ node, children, ...props }) {
        return (
          <h1 className="text-2xl font-bold my-4" {...props}>
            {children}
          </h1>
        );
      },
      h2({ node, children, ...props }) {
        return (
          <h2 className="text-xl font-bold my-3" {...props}>
            {children}
          </h2>
        );
      },
      h3({ node, children, ...props }) {
        return (
          <h3 className="text-lg font-bold my-2" {...props}>
            {children}
          </h3>
        );
      },
      // 自定义列表样式
      ul({ node, children, ...props }) {
        return (
          <ul className="list-disc list-inside my-2" {...props}>
            {children}
          </ul>
        );
      },
      ol({ node, children, ...props }) {
        return (
          <ol className="list-decimal list-inside my-2" {...props}>
            {children}
          </ol>
        );
      },
      // 自定义引用块样式
      blockquote({ node, children, ...props }) {
        return (
          <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic" {...props}>
            {children}
          </blockquote>
        );
      },
    }
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown {...options}>
        {content}
      </ReactMarkdown>
    </div>
  );
} 