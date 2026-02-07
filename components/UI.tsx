import React, { useEffect } from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-lg ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50",
    secondary: "bg-dark-700 hover:bg-dark-600 text-gray-200",
    outline: "border border-dark-600 hover:border-brand-500 text-gray-400 hover:text-brand-400 bg-transparent"
  };
  
  return (
    <button 
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-brand-900 text-brand-200' }) => (
  <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${color}`}>
    {children}
  </span>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin`}></div>
  );
};

export const TerminalLog: React.FC<{ logs: string[] }> = ({ logs }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs sm:text-sm shadow-inner scrollbar-hide" ref={scrollRef}>
            {logs.length === 0 && <span className="text-gray-600 opacity-50">Waiting for input...</span>}
            {logs.map((log, i) => (
                <div key={i} className="mb-1 text-gray-300 border-l-2 border-brand-500/50 pl-2">
                    <span className="text-brand-400 mr-2">➜</span>
                    {log}
                </div>
            ))}
        </div>
    );
};

export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-brand-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-brand-400/50">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      {message}
    </div>
  );
};
