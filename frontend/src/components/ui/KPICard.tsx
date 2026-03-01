import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
}

export default function KPICard({ title, value, icon, trend, className = '' }: KPICardProps) {
    return (
        <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                            {trend.positive ? 'trending_up' : 'trending_down'}
                        </span>
                        {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
