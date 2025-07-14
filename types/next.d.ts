import { NextApiRequest, NextApiResponse } from 'next';

declare module 'next' {
  interface NextApiRequestWithFiles extends NextApiRequest {
    files?: any;
    file?: any;
  }

  interface NextApiResponseWithFiles extends NextApiResponse {
    json: (body: any) => void;
  }
}
