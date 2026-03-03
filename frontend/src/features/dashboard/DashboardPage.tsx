export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="relative text-center max-w-2xl mx-auto px-8">
                {/* Animated background glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 via-indigo-500/5 to-violet-500/8 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-cyan-500/5 via-primary/3 to-emerald-500/5 rounded-full blur-2xl animate-pulse [animation-delay:1s]" />
                </div>

                {/* Icon */}
                <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="absolute w-24 h-24 bg-primary/10 rounded-full animate-ping [animation-duration:3s]" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-4xl">rocket_launch</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                    Dashboard <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-500 bg-clip-text text-transparent">Coming Soon</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg mx-auto">
                    We're building a powerful analytics dashboard with real-time insights, performance metrics, and intelligent recruitment analytics.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                    {[
                        { icon: 'monitoring', label: 'Real-time Analytics' },
                        { icon: 'insights', label: 'AI Insights' },
                        { icon: 'bar_chart', label: 'Performance Metrics' },
                        { icon: 'timeline', label: 'Pipeline Tracking' },
                    ].map((feature) => (
                        <div
                            key={feature.label}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm hover:shadow-md hover:border-primary/30 hover:text-primary transition-all duration-300"
                        >
                            <span className="material-symbols-outlined text-lg text-primary/70">{feature.icon}</span>
                            {feature.label}
                        </div>
                    ))}
                </div>

             
            </div>
        </div>
    );
}
