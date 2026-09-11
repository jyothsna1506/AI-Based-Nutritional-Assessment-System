import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-slate-50 border border-slate-200 rounded-xl
            py-2.5 text-sm text-[#0a192f] placeholder-slate-400 font-bold
            transition-all duration-200
            hover:border-slate-300
            focus:bg-white
            focus:border-[#0284c7]
            focus:ring-2 focus:ring-[#0284c7]/20
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-slate-50 border border-slate-200 rounded-xl
          px-4 py-2.5 text-sm text-[#0a192f] font-bold
          transition-all duration-200
          hover:border-slate-300 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20
          appearance-none cursor-pointer
          [&>option]:bg-white [&>option]:text-[#0a192f]
          ${error ? 'border-rose-500' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      )}
      <textarea
        className={`
          w-full bg-slate-50 border border-slate-200 rounded-xl
          px-4 py-3 text-sm text-[#0a192f] placeholder-slate-400 font-bold
          transition-all duration-200 hover:border-slate-300 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 min-h-[100px] resize-y
          ${error ? 'border-rose-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
