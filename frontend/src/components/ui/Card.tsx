import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`mb-5 flex items-center justify-between ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: CardProps) {
    return (
        <h3 className={`text-base font-bold tracking-tight text-slate-900 ${className}`}>
            {children}
        </h3>
    );
}
