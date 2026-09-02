import { Link } from 'react-router-dom';

const pageContent = {
    about: {
        title: 'About TechStore',
        text: 'TechStore brings modern technology products and accessories to customers across Bangladesh.',
    },
    privacy: {
        title: 'Privacy Policy',
        text: 'We use your account and delivery information only to process orders, provide support, and improve our service.',
    },
    terms: {
        title: 'Terms & Conditions',
        text: 'Orders are subject to product availability, price confirmation, and our delivery and return policies.',
    },
    returns: {
        title: 'Return Policy',
        text: 'If a delivered item is defective or incorrect, please contact our support team within 7 days of delivery.',
    },
};

const InfoPage = ({ type }) => {
    const content = pageContent[type];

    return (
        <main className="max-w-3xl mx-auto p-6 md:p-10 min-h-[50vh]">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{content.title}</h1>
                <p className="text-gray-600 leading-relaxed">{content.text}</p>
                <Link to="/" className="inline-block mt-6 text-sm font-bold text-blue-600 hover:text-blue-700">
                    ← Back to Home
                </Link>
            </div>
        </main>
    );
};

export default InfoPage;
