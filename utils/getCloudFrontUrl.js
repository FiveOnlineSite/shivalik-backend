const getCloudFrontUrl = (filePathOrUrl) => {
  if (!filePathOrUrl) return "";

  const cloudFrontBaseUrl = process.env.CLOUDFRONT_BASE_URL;

  if (!cloudFrontBaseUrl) {
    return filePathOrUrl;
  }

  const cleanCloudFrontBaseUrl = cloudFrontBaseUrl.replace(/\/$/, "");

  // Already full CloudFront URL
  if (filePathOrUrl.startsWith(cleanCloudFrontBaseUrl)) {
    return filePathOrUrl;
  }

  // If full S3 URL is passed, replace S3 base with CloudFront base
  if (
    process.env.S3_BASE_URL &&
    filePathOrUrl.startsWith(process.env.S3_BASE_URL)
  ) {
    return filePathOrUrl.replace(
      process.env.S3_BASE_URL.replace(/\/$/, ""),
      cleanCloudFrontBaseUrl
    );
  }

  // If only S3 key/path is passed
  const cleanPath = filePathOrUrl.replace(/^\//, "");

  return `${cleanCloudFrontBaseUrl}/${cleanPath}`;
};

module.exports = getCloudFrontUrl;