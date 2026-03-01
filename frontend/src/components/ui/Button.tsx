import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'active';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    className = '',
    disabled,
    ...props
}: ButtonProps) {

    let baseStyles = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    switch (variant) {
        case 'primary':
            baseStyles += " bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20";
            break;
        case 'secondary':
            baseStyles += " bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";
            break;
        case 'outline':
            baseStyles += " bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
            break;
        case 'ghost':
            baseStyles += " bg-transparent text-slate-600 hover:bg-slate-50";
            break;
        case 'active':
            baseStyles += " bg-primary/10 text-primary border border-primary/20";
            break;
        case 'danger':
            baseStyles += " bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20";
            break;
    }

    switch (size) {
        case 'sm':
            baseStyles += " px-4 py-2 text-xs";
            break;
        case 'md':
            baseStyles += " px-5 py-2.5 text-sm";
            break;
        case 'lg':
            baseStyles += " px-6 py-3 text-base";
            break;
    }

    return (
        <button
            className={`${baseStyles} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : icon ? (
                <span className="flex items-center justify-center">
                    {icon}
                </span>
            ) : null}
            {children}
        </button>
    );
}
