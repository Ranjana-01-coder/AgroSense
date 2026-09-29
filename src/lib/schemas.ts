
"use client";

import { z } from "zod";

export const diseaseDetectionSchema = z.object({
  image: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Crop image is required.")
    .refine(
      (files) => files && files[0].type.startsWith("image/"),
      "Please upload an image file."
    ),
});


export const languageEnum = z.enum([
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Hindi',
  'Marathi',
  'Malayalam',
]);
