
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

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{start}–{end}</span> of <span className="font-bold text-slate-700">{totalItems}</span> results
            </span>
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${currentPage === i + 1
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
