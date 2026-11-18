import { useId } from "react";

/* 2D version of the chrome VR monogram (R welded into the V's right arm). */
export default function Mark({ size = 28, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size * 0.8} viewBox="0 0 40 32" aria-hidden="true">
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".38" stopColor="#a9adb7" />
          <stop offset=".55" stopColor="#f6f7f9" />
          <stop offset=".8" stopColor="#6e737d" />
          <stop offset="1" stopColor="#d6d9df" />
        </linearGradient>
      </defs>
      <path d="M4 4 L14 28 L24 4 C34 3 31 15.2 19.4 15 M21.5 15 L34 28" fill="none" stroke={`url(#c${id})`} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="29.7" r="2.2" fill="#2F4BFF" />
    </svg>
  );
}
