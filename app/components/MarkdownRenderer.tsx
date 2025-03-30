import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Options } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const options: Options = {
    remarkPlugins: [remarkGfm],
    components: {
      code: ({ inline, className, children, ...props }: CodeProps) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        ) : (
          <code className="bg-gray-800 rounded px-1 py-0.5" {...props}>
            {children}
          </code>
        );
      },
      a: ({ children, ...props }) => (
        <a
          className="text-blue-400 hover:text-blue-300 underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),
      h1: ({ children, ...props }) => (
        <h1 className="text-2xl font-bold my-4" {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2 className="text-xl font-bold my-3" {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3 className="text-lg font-bold my-2" {...props}>
          {children}
        </h3>
      ),
      ul: ({ children, ...props }) => (
        <ul className="list-disc list-inside my-2" {...props}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }) => (
        <ol className="list-decimal list-inside my-2" {...props}>
          {children}
        </ol>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic" {...props}>
          {children}
        </blockquote>
      ),
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