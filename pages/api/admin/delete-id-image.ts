import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();
    
    const { userId, side } = req.body;

    if (!userId || !side || !['front', 'back'].includes(side)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has ID card data
    if (!user.idCard) {
      return res.status(400).json({ message: 'No ID card data found for this user' });
    }

    // Get the image URL to delete from S3
    const imageUrl = user.idCard[`${side}Image`];
    
    if (!imageUrl) {
      return res.status(400).json({ message: `No ${side} image found` });
    }

    // Extract the S3 object key from the URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove 'https://', bucket name, and region

    // Delete from S3
    try {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'your-bucket-name',
        Key: key,
      };
      
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue even if S3 deletion fails to ensure database consistency
    }

    // Update user document
    user.idCard[`${side}Image`] = '';
    user.idCard.verified = false;
    
    // If both images are empty, remove the idCard object
    if (!user.idCard.frontImage && !user.idCard.backImage) {
      user.idCard = undefined;
    }

    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: `ID card ${side} image deleted successfully` 
    });

  } catch (error) {
    console.error('Error deleting ID card image:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
