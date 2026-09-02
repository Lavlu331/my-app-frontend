import { Link } from 'react-router-dom';

const NotFound = () => <div className="min-h-[65vh] flex items-center justify-center p-6"><div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-10 text-center max-w-md"><p className="text-6xl mb-4">🧭</p><h1 className="text-4xl font-black text-gray-800">404</h1><p className="text-gray-500 mt-2 mb-6">পৃষ্ঠা পাওয়া যায়নি। হয়তো link-টি ভুল অথবা page সরানো হয়েছে।</p><Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm">Back to Home</Link></div></div>;

export default NotFound;
