import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 45,
          background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M18 22l14 10 14-10M18 42l14-10 14 10"
            stroke="#fff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="18" cy="22" r="5" fill="#fff" />
          <circle cx="46" cy="22" r="5" fill="#fff" />
          <circle cx="32" cy="32" r="5" fill="#fff" />
          <circle cx="18" cy="42" r="5" fill="#fff" />
          <circle cx="46" cy="42" r="5" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
