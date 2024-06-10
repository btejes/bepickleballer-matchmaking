import { connectToDatabase } from '../../library/connectToDatabase';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export const GET = async (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed' });
};

export const POST = async (req, res) => {
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
};
