/* Every environment variable is read here and nowhere else. This module is
   only ever imported by the API server — it is not part of the client build,
   which is what keeps the CMS key out of the browser. A missing variable
   fails at boot rather than at the first request. */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export const cmsApiUrl = () => required("CMS_API_URL");
export const cmsApiKey = () => required("CMS_API_KEY");
export const revalidationSecret = () => required("REVALIDATION_SECRET");

export const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

/* The values the browser is allowed to know. They are served to the client at
   runtime from GET /api/config rather than baked into the bundle, so one build
   artifact can run in staging and production. */
export function publicConfig() {
  return {
    siteUrl: required("PUBLIC_SITE_URL"),
    signupUrl: required("PUBLIC_SIGNUP_URL"),
    loginUrl: required("PUBLIC_LOGIN_URL"),
    /* Site-wide noindex. Every page ships `noindex, nofollow` until
       PUBLIC_ALLOW_INDEXING is exactly "true". */
    noIndex: process.env.PUBLIC_ALLOW_INDEXING !== "true",
  };
}

/* Fails fast at boot: better a dead start than a site that 401s on its first
   visitor or points its canonicals at localhost. */
export function assertConfig() {
  cmsApiUrl();
  cmsApiKey();
  revalidationSecret();
  publicConfig();
}
