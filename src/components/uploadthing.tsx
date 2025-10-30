'use client';

import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Generate components with the proper generic type
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export type UploadFileResponse = {
  url: string;
  name: string;
  size: number;
};

