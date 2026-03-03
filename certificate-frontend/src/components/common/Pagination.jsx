import React from 'react';
import Button from '../ui/Button';

const Pagination = ({
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNext,
    hasPrevious,
    onPageChange,
    onLimitChange,
    className = "",
    showItemsPerPage = true,
    showPageNumbers = true,
    itemsPerPageOptions = [10, 20, 50, 100]
}) => {
    // Calculate page numbers to display
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`bg-white border-t border-gray-200 px-4 py-3 sm:px-6 ${className}`}>
            {/* Mobile View */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left Section - Items per page */}
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Show:</span>
                        <div className="relative">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => onLimitChange(Number(e.target.value))}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
                            >
                                {itemsPerPageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option} per page
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center Section - Page Info */}
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {startItem.toLocaleString()} - {endItem.toLocaleString()}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900">
                            {totalItems.toLocaleString()}
                        </span>{' '}
                        items
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                {/* Right Section - Pagination Controls */}
                <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={!hasPrevious}
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                            hasPrevious
                                ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-300'
                                : 'text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                        aria-label="Previous page"
                    >
                        <i className="fas fa-chevron-left text-sm"></i>
                    </button>

                    {/* Page Numbers */}
                    {showPageNumbers && (
                        <div className="flex items-center gap-1">
                            {pageNumbers.map((pageNumber, index) => (
                                <React.Fragment key={index}>
                                    {pageNumber === '...' ? (
                                        <span className="px-3 py-1 text-gray-400">...</span>
                                    ) : (
                                        <button
                                            onClick={() => onPageChange(pageNumber)}
                                            className={`min-w-[40px] h-9 px-3 rounded-lg font-medium transition-all duration-200 ${
                                                currentPage === pageNumber
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Quick Navigation */}
                    {showPageNumbers && (
                        <div className="hidden md:flex items-center gap-2 ml-2">
                            <span className="text-sm text-gray-500">Go to:</span>
                            <div className="relative w-20">
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    defaultValue={currentPage}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const page = parseInt(e.target.value);
                                            if (page >= 1 && page <= totalPages) {
                                                onPageChange(page);
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Page"
                                />
                            </div>
                        </div>
                    )}

                    {/* Next Button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                            hasNext
                                ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-300'
                                : 'text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                        aria-label="Next page"
                    >
                        <i className="fas fa-chevron-right text-sm"></i>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${(currentPage / totalPages) * 100}%`
                        }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Start</span>
                    <span>{Math.round((currentPage / totalPages) * 100)}%</span>
                    <span>End</span>
                </div>
            </div>

            {/* Quick Page Jumps */}
            {totalPages > 10 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Button
                        onClick={() => onPageChange(1)}
                        variant="outline"
                        size="extra-small"
                        disabled={currentPage === 1}
                        className="text-xs"
                    >
                        <i className="fas fa-angle-double-left mr-1"></i>
                        First
                    </Button>
                    <Button
                        onClick={() => onPageChange(Math.max(1, currentPage - 5))}
                        variant="outline"
                        size="extra-small"
                        disabled={!hasPrevious}
                        className="text-xs"
                    >
                        <i className="fas fa-angle-left mr-1"></i>
                        -5 Pages
                    </Button>
                    <Button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
                        variant="outline"
                        size="extra-small"
                        disabled={!hasNext}
                        className="text-xs"
                    >
                        +5 Pages
                        <i className="fas fa-angle-right ml-1"></i>
                    </Button>
                    <Button
                        onClick={() => onPageChange(totalPages)}
                        variant="outline"
                        size="extra-small"
                        disabled={currentPage === totalPages}
                        className="text-xs"
                    >
                        Last
                        <i className="fas fa-angle-double-right ml-1"></i>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Pagination;