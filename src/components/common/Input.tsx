import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  suffix?: ReactNode;
}

export const Input = ({ label, id, suffix, className = '', ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-[15px] text-gray-800">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          className={`w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 ${
            suffix ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};
