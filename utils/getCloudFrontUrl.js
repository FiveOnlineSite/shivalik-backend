const getCloudFrontUrl = (url) => {
  if (!url) return "";

  const s3BaseUrl = process.env.S3_BASE_URL;
  const cloudFrontBaseUrl = process.env.CLOUDFRONT_BASE_URL;

  if (!s3BaseUrl || !cloudFrontBaseUrl) {
    return url;
  }

  return url.replace(s3BaseUrl, cloudFrontBaseUrl);
};

module.exports = getCloudFrontUrl;