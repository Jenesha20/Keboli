import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
            <Sidebar />
            <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
                <Header />
                <main className="mt-[72px] p-10 flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
                <footer className="py-8 px-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] border-t border-slate-100">
                    Keboli Platform • Intelligence Governance • Unified Protocol
                </footer>
            </div>
        </div>
    )
}
