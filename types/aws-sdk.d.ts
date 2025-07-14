import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

declare module '@aws-sdk/client-s3' {
  export * from '@aws-sdk/client-s3/dist-types/commands';
  export * from '@aws-sdk/client-s3/dist-types/pagination';
  export * from '@aws-sdk/client-s3/dist-types/waiters';
  
  // Re-export the S3Client and PutObjectCommand for better type inference
  export { S3Client, PutObjectCommand };
}
