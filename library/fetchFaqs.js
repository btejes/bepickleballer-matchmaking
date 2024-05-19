// library/fetchFaqs.js

export const fetchFaqs = async () => {
    const baseURL = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-production-url.com';
    const res = await fetch(`${baseURL}/api/faqs`);
    const data = await res.json();
    return data;
  };
  