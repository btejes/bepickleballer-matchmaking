import { connectToDatabase } from '../../library/connectToDatabase';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export default async (req, res) => {
  if (req.method === 'POST') {
    const token = getCookie('jwt', { req, res });
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId, profileImage } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { db } = await connectToDatabase();
      await db.collection('users').updateOne(
        { _id: userId },
        { $set: { profileImage } }
      );

      return res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (error) {
      console.error('Error updating profile image:', error);
      return res.status(500).json({ error: 'Error updating profile image' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
