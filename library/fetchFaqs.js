// library/fetchFaqs.js

export const fetchFaqs = async () => {
  const baseURL = process.env.BASE_URL;
  const res = await fetch(`${baseURL}/api/faqs`);
  if (!res.ok) {
    throw new Error('Failed to fetch FAQs');
  }
  const data = await res.json();
  return data;
};
