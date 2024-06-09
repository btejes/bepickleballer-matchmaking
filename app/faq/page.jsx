import Navbar from '@/components/Navbar';
import FaqComponent from './faqComponent';

export const metadata = {
  title: 'FAQs - Pickleball Matchmaking',
  description: 'Frequently Asked Questions about Pickleball Matchmaking',
};

export const revalidate = 60; // revalidate the page every 60 seconds

async function FaqPage() {
  let faqs = [];
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  try {
    console.log("\nFetching api faqs!\n");
    const res = await fetch(`${process.env.BASE_URL}${basePath}/api/faqs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensures data fetching happens at runtime and not during build
    });

    if (!res.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    faqs = await res.json();
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="font-luckiest text-center text-4xl md:text-6xl mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqComponent key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
