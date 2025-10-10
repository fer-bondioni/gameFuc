import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({ 
  onClick, 
  children, 
  variant = 'primary', 
  fullWidth = false,
  disabled = false 
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-6 py-3 rounded-lg font-medium transition-colors',
        fullWidth && 'w-full',
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </motion.button>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-700/20', className)}>
      {children}
    </div>
  );
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 text-lg border-2 border-slate-200 dark:border-slate-600 
        bg-white dark:bg-slate-700 text-black dark:text-white
        rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        placeholder:text-slate-400 dark:placeholder:text-slate-400
        shadow-sm transition-all duration-200"
    />
  );
}