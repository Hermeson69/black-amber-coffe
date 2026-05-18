import sharp from "sharp";

export interface ProcessedImages {
  large: Buffer;
  small: Buffer;
  contentType: string;
}

export interface ImageDimensions {
  large: { width: number; height: number };
  small: { width: number; height: number };
}

const DEFAULT_DIMENSIONS: ImageDimensions = {
  large: { width: 512, height: 512 },
  small: { width: 128, height: 128 },
};

export const imageService = {
  async processAvatar(
    buffer: Buffer,
    dimensions: ImageDimensions = DEFAULT_DIMENSIONS,
  ): Promise<ProcessedImages> {
    const largeBuffer = await sharp(buffer)
      .resize(dimensions.large.width, dimensions.large.height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85 })
      .toBuffer();

    const smallBuffer = await sharp(buffer)
      .resize(dimensions.small.width, dimensions.small.height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    return {
      large: largeBuffer,
      small: smallBuffer,
      contentType: "image/webp",
    };
  },

  generateAvatarKeys(userPublicId: string): { large: string; small: string } {
    const timestamp = Date.now();
    return {
      large: `images/${userPublicId}/${timestamp}-lg.webp`,
      small: `images/${userPublicId}/${timestamp}-sm.webp`,
    };
  },
};