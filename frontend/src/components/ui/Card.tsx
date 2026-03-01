import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`mb-4 flex items-center justify-between ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: CardProps) {
    return (
        <h3 className={`text-base font-black tracking-tight text-slate-900 ${className}`}>
            {children}
        </h3>
    );
}
