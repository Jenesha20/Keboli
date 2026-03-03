
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function Header() {
    const { logout } = useAuth()

    return (
        <header className="h-[64px] fixed top-0 right-0 left-[264px] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-8 z-10 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4 w-1/2">
                <div className="relative w-full max-w-md group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-primary">search</span>
                    <input
                        className="w-full pl-11 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/50 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                        placeholder="Search candidates, assessments..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border-r border-slate-200/80 pr-4 mr-1">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                    </button>
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold rounded-xl transition-all text-xs border border-slate-200 hover:border-rose-200 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                </button>
            </div>
        </header>
    )
}
