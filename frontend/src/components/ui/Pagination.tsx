
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}: PaginationProps) {
    if (totalItems === 0) return null;

    return (
        <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {Math.min((currentPage * itemsPerPage), totalItems)} of {totalItems} entries
            </span>
            {totalPages > 1 && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-8 h-8 text-xs font-black rounded-lg transition-all ${currentPage === i + 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
