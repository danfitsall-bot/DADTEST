/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js (Turbopack) not to bundle these server-only packages.
  // This lets Node.js require() them at runtime instead, avoiding
  // the Deno test files bundled inside yahoo-finance2's ESM build.
  serverExternalPackages: ['yahoo-finance2', 'nodemailer', '@vercel/blob'],
  turbopack: {},
};

export default nextConfig;
