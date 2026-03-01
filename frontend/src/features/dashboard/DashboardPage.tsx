import { useState, useEffect } from 'react';
import KPICard from '../../components/ui/KPICard';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { apiClient } from '../../services/apiClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export default function DashboardPage() {
    const [kpis, setKpis] = useState({ total_candidates: 0, active_assessments: 0, completed_interviews: 0, average_score: 0 });
    const [statusDist, setStatusDist] = useState<Record<string, number>>({});
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get('/dashboard/kpis').then((r: { data: typeof kpis }) => setKpis(r.data)).catch(() => { });
        apiClient.get('/dashboard/status-distribution').then((r: { data: Record<string, number> }) => setStatusDist(r.data)).catch(() => { });
        apiClient.get('/dashboard/recent-activity').then((r: { data: unknown[] }) => setRecentActivity(r.data as never[])).catch(() => { });
    }, []);

    const pieData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

    const barData = [
        { name: 'Mon', interviews: 4 },
        { name: 'Tue', interviews: 7 },
        { name: 'Wed', interviews: 5 },
        { name: 'Thu', interviews: 9 },
        { name: 'Fri', interviews: 6 },
        { name: 'Sat', interviews: 2 },
        { name: 'Sun', interviews: 1 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Intelligence overview of your recruitment pipeline</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    title="Total Candidates"
                    value={kpis.total_candidates}
                    icon={<span className="material-symbols-outlined">groups</span>}
                    trend={{ value: 12, positive: true }}
                />
                <KPICard
                    title="Active Assessments"
                    value={kpis.active_assessments}
                    icon={<span className="material-symbols-outlined">assignment</span>}
                />
                <KPICard
                    title="Completed Interviews"
                    value={kpis.completed_interviews}
                    icon={<span className="material-symbols-outlined">check_circle</span>}
                    trend={{ value: 8, positive: true }}
                />
                <KPICard
                    title="Average Score"
                    value={kpis.average_score ? `${kpis.average_score}%` : '—'}
                    icon={<span className="material-symbols-outlined">grade</span>}
                />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Interview Status</CardTitle></CardHeader>
                    <div className="h-64">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-20">pie_chart</span>
                                <p className="text-xs font-bold uppercase tracking-widest">No status data yet</p>
                            </div>
                        )}
                    </div>
                    {pieData.length > 0 && (
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                            {pieData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d.name}: {d.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="interviews" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader><CardTitle>Recent Interview Activity</CardTitle></CardHeader>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session ID</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent sessions detected</p>
                                    </td>
                                </tr>
                            ) : (
                                recentActivity.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{s.id?.slice(0, 8)}…</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={s.status === 'COMPLETED' ? 'success' : s.status === 'IN_PROGRESS' ? 'active' : 'secondary'}>
                                                {s.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">
                                                    {s.started_at ? new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 uppercase">Started</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
