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
        <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 group ${className}`}>
            <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary/12 transition-colors">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${trend.positive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                            {trend.positive ? 'trending_up' : 'trending_down'}
                        </span>
                        {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
