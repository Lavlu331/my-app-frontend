const Skeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                    {/* Image placeholder */}
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                    
                    {/* Title placeholder */}
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    
                    {/* Price placeholder */}
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    
                    {/* Button placeholder */}
                    <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                </div>
            ))}
        </div>
    );
};

export default Skeleton;