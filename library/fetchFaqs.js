// library/fetchFaqs.js

export const fetchFaqs = async () => {
  const baseURL = process.env.BASE_URL;
  try {
    const res = await fetch(`${baseURL}/api/faqs`);
    if (!res.ok) {
      throw new Error('Failed to fetch FAQs');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};
