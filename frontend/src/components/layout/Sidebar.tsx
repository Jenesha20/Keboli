import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard', path: '/' },
    { id: 'assessments', label: 'Assessments', icon: 'assignment', path: '/assessments' },
    { id: 'candidates', label: 'Candidates', icon: 'group', path: '/candidates' },
    { id: 'interviews', label: 'Interviews', icon: 'videocam', path: '/interviews' },
]

export default function Sidebar() {
    const { user } = useAuth()
    const location = useLocation()

    return (
        <aside className="w-[264px] fixed inset-y-0 left-0 bg-white border-r border-slate-200/80 flex flex-col z-20 shadow-[1px_0_12px_-4px_rgba(0,0,0,0.05)]">
            {/* Brand */}
            <div className="px-7 py-7 flex items-center gap-3.5">
                <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-primary/25">
                    <span className="material-symbols-outlined text-[22px] leading-none">psychology</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-extrabold text-[18px] tracking-tight text-slate-900 leading-tight">Keboli</span>
                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-[0.15em] leading-none mt-0.5">AI Platform</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] px-4 mb-3">Menu</p>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/')
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold text-sm">{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />}
                        </Link>
                    )
                })}

                <div className="pt-6 mt-6 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] px-4 mb-3">System</p>
                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-600">settings</span>
                        <span className="font-semibold text-sm">Settings</span>
                    </Link>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-5 border-t border-slate-100 bg-gradient-to-t from-slate-50/80 to-transparent">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-100 border border-primary/10 overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">person</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-slate-800 truncate">{user?.email?.split('@')[0] || 'User'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Hiring Manager</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
