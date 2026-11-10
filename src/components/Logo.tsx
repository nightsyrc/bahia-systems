export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Bahía Systems" fill="none">
      <rect width="32" height="32" rx="8" fill="#0B3954" />
      <path d="M6 20c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" stroke="#00A3A1" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 14.5c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" stroke="#F3F8F8" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
      <path d="M6 25.5c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" stroke="#00A3A1" strokeWidth="2.2" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
