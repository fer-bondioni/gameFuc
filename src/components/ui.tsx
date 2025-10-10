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
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-8 py-4 rounded-2xl font-bold transition-all text-lg shadow-xl',
        fullWidth && 'w-full',
        variant === 'primary' 
          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:shadow-pink-500/50' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-yellow-500/50',
        disabled && 'opacity-50 cursor-not-allowed grayscale'
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
    <div className={clsx(
      'bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl',
      'border-4 border-white/20',
      className
    )}>
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
      className="w-full px-6 py-4 text-xl border-4 border-purple-300
        bg-white/80 backdrop-blur-sm text-gray-900 font-bold
        rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500 focus:border-pink-500
        placeholder:text-purple-400
        shadow-xl transition-all duration-300"
    />
  );
}
