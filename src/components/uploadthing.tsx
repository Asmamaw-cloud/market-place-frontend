'use client';

import { generateReactHelpers } from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Export UploadButton component directly
export { UploadButton, UploadDropzone, Uploader } from '@uploadthing/react';

export type UploadFileResponse = {
  url: string;
  name: string;
  size: number;
};

