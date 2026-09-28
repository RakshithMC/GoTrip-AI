import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertCircle, FileImage } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.error;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-3xl gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-indigo-600' : isError ? 'bg-red-500/10' : 'bg-emerald-600'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content Content */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Sender Name */}
          <span className="text-xs text-slate-500 font-medium">
            {isUser ? 'You' : isError ? 'System Error' : 'Gemini'}
          </span>

          {/* Attachments (Images) */}
          {message.attachments && message.attachments.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-1">
               {message.attachments.map((att, index) => (
                 <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-700">
                   <img 
                     src={att.previewUrl} 
                     alt="User attachment" 
                     className="w-48 h-auto object-cover max-h-64"
                   />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <FileImage className="w-6 h-6 text-white drop-shadow-lg" />
                   </div>
                 </div>
               ))}
             </div>
          )}

          {/* Text Bubble */}
          <div className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : isError
                ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-tl-none'
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }
          `}>
            {isError ? (
              <p>{message.text}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none break-words">
                 <ReactMarkdown
                   components={{
                     code({node, inline, className, children, ...props}: any) {
                        return !inline ? (
                          <pre className="bg-slate-950/50 p-3 rounded-lg border border-slate-700/50 overflow-x-auto my-2 no-scrollbar">
                            <code {...props} className="text-xs font-mono text-indigo-200">
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code {...props} className="bg-slate-950/50 px-1.5 py-0.5 rounded text-indigo-200 font-mono text-xs">
                            {children}
                          </code>
                        );
                     }
                   }}
                 >
                   {message.text || '...'}
                 </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;