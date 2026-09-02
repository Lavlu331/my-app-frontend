import { useEffect, useState } from 'react';

const BackToTop = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 350);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!visible) return null;
    return <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed right-5 bottom-20 md:bottom-6 z-40 w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg font-black hover:bg-blue-700" aria-label="Back to top">↑</button>;
};

export default BackToTop;
