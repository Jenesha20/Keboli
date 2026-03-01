import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export default function Input({ label, helperText, icon, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${icon ? 'pl-11' : ''} ${className}`}
                    {...props}
                />
            </div>

            {helperText && (
                <p className="text-[11px] font-bold text-slate-400 ml-1 mt-0.5">
                    {helperText}
                </p>
            )}
        </div>
    );
}
