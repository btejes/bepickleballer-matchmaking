import { fetchFaqs } from '@/library/fetchFaqs';
import Navbar from '@/library/Navbar';
import FaqComponent from './faqComponent';

export const metadata = {
  title: 'FAQs - Pickleball Matchmaking',
  description: 'Frequently Asked Questions about Pickleball Matchmaking',
};

export const revalidate = 60; // revalidate the page every 60 seconds

const FaqPage = async () => {
  const faqs = await fetchFaqs();

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
};

export default FaqPage;
