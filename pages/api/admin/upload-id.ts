import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const formData = await new Promise((resolve, reject) => {
    const form = new (require('formidable').IncomingForm)();
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
  return formData as { fields: any; files: any };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();
    
    const { fields, files } = await parseForm(req);
    const { userId, side } = fields;
    const file = files?.file?.[0];

    if (!userId || !side || !['front', 'back'].includes(side) || !file) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique filename
    const fileExtension = file.originalFilename.split('.').pop();
    const fileName = `id-cards/${userId}-${side}-${Date.now()}.${fileExtension}`;

    // Upload to S3
    const fileContent = require('fs').readFileSync(file.filepath);
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'your-bucket-name',
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Construct the public URL
    const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Update user document
    if (!user.idCard) {
      user.idCard = {
        frontImage: side === 'front' ? imageUrl : '',
        backImage: side === 'back' ? imageUrl : '',
        uploadedAt: new Date(),
        verified: false,
      };
    } else {
      user.idCard[`${side}Image`] = imageUrl;
      user.idCard.uploadedAt = new Date();
      user.idCard.verified = false;
    }

    await user.save();

    return res.status(200).json({ 
      success: true, 
      imageUrl,
      message: 'ID card image uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading ID card image:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
