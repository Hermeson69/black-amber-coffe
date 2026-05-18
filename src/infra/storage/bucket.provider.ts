import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { IStorageProvider, UploadResult } from "./bucket.interface";
import { env } from "@/config/env";

const client = new S3Client({
  region: env.BUCKET_REGION,
  endpoint: env.BUCKET_URL,
  credentials: {
    accessKeyId: env.BUCKET_ACCESS_KEY,
    secretAccessKey: env.BUCKET_SECRET_KEY,
  },
});
