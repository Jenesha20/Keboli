import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'indigo' | 'blue' | 'active';
    className?: string;
}

export default function Badge({ children, variant = 'secondary', className = '' }: BadgeProps) {
    const variants = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-slate-100 text-slate-600 border-slate-200/80',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
        error: 'bg-rose-50 text-rose-700 border-rose-200/80',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
        active: 'bg-primary/10 text-primary border-primary/20'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${variants[variant] || variants.secondary} ${className}`}>
            {children}
        </span>
    );
}
