import React from 'react';

export default function EngineeringBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left-side fade: opaque at edge, transparent toward center */}
          <linearGradient id="ebLeftFade" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="60%"  stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="ebLeftMask" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="560" height="900" fill="url(#ebLeftFade)" />
          </mask>

          {/* Right-side fade */}
          <linearGradient id="ebRightFade" x1="1440" y1="0" x2="880" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="60%"  stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="ebRightMask" maskUnits="userSpaceOnUse">
            <rect x="880" y="0" width="560" height="900" fill="url(#ebRightFade)" />
          </mask>

          {/* Node glow filter */}
          <filter id="ebNodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ─── LEFT SIDE TRACES ─── */}
        <g mask="url(#ebLeftMask)">

          {/* Primary orthogonal trace routing */}
          <g stroke="#a78bfa" strokeWidth="0.7" fill="none" opacity="0.22">
            {/* Upper cluster */}
            <path d="M 0 115 H 270 V 185 H 410 V 145" />
            <path d="M 0 185 H 145 V 265 H 330 V 185" />
            <path d="M 85 115 V 185" />
            <path d="M 270 115 V 62 H 380" />
            <path d="M 380 62 H 455 V 115" />

            {/* Upper-mid band */}
            <path d="M 0 315 H 230 V 258 H 395 V 315 H 490" />
            <path d="M 230 315 V 375 H 350 V 315" />
            <path d="M 145 265 V 315" />
            <path d="M 410 145 V 258" />
            <path d="M 490 315 V 375 H 540" />

            {/* Centre-left cluster */}
            <path d="M 0 455 H 290 V 398 H 435 V 455 H 530" />
            <path d="M 290 455 V 515 H 170 V 455" />
            <path d="M 170 515 V 572 H 315 V 515" />
            <path d="M 350 375 V 455" />
            <path d="M 85 455 V 515" />
            <path d="M 530 398 V 455" />

            {/* Lower-mid band */}
            <path d="M 0 615 H 205 V 672 H 370 V 615 H 488" />
            <path d="M 205 615 V 558 H 315 V 615" />
            <path d="M 108 572 V 615" />
            <path d="M 370 615 V 695 H 248 V 615" />
            <path d="M 488 615 V 695" />

            {/* Lower cluster */}
            <path d="M 0 758 H 265 V 818 H 408" />
            <path d="M 0 818 H 142 V 758" />
            <path d="M 265 758 V 695" />
            <path d="M 142 818 V 858 H 288 V 818" />
            <path d="M 408 818 V 858" />
          </g>

          {/* Fine semiconductor-style detail routing — thinner, lower opacity */}
          <g stroke="#a78bfa" strokeWidth="0.4" fill="none" opacity="0.11">
            <path d="M 42 185 V 315" />
            <path d="M 185 265 H 230" />
            <path d="M 435 398 V 455" />
            <path d="M 315 515 V 558" />
            <path d="M 205 672 V 758" />
            <path d="M 370 695 V 758" />
            <path d="M 488 375 V 455" />
            <path d="M 38 455 V 515" />
            <path d="M 248 695 V 758" />
          </g>

          {/* Junction pads */}
          <g fill="#a78bfa" opacity="0.28">
            <circle cx="270" cy="115" r="2.5" />
            <circle cx="270" cy="185" r="2" />
            <circle cx="410" cy="185" r="2.5" />
            <circle cx="145" cy="185" r="2" />
            <circle cx="145" cy="265" r="2" />
            <circle cx="380" cy="62"  r="2" />
            <circle cx="85"  cy="185" r="1.5" />
            <circle cx="230" cy="315" r="2.5" />
            <circle cx="395" cy="315" r="2" />
            <circle cx="230" cy="375" r="2" />
            <circle cx="350" cy="375" r="1.5" />
            <circle cx="290" cy="455" r="2.5" />
            <circle cx="435" cy="455" r="2" />
            <circle cx="170" cy="515" r="2" />
            <circle cx="315" cy="515" r="2" />
            <circle cx="205" cy="615" r="2.5" />
            <circle cx="370" cy="615" r="2" />
            <circle cx="248" cy="615" r="1.5" />
            <circle cx="265" cy="758" r="2.5" />
            <circle cx="142" cy="818" r="2" />
            <circle cx="265" cy="695" r="1.5" />
            <circle cx="488" cy="695" r="1.5" />
          </g>

          {/* Glowing accent nodes (highlight junctions) */}
          <g fill="#c084fc" filter="url(#ebNodeGlow)" opacity="0.35">
            <circle cx="270" cy="185" r="3.5" />
            <circle cx="290" cy="455" r="4" />
            <circle cx="205" cy="615" r="3.5" />
            <circle cx="395" cy="258" r="3" />
            <circle cx="170" cy="515" r="3" />
          </g>
        </g>

        {/* ─── RIGHT SIDE TRACES (horizontally mirrored) ─── */}
        <g mask="url(#ebRightMask)">

          <g stroke="#a78bfa" strokeWidth="0.7" fill="none" opacity="0.22">
            {/* Upper cluster */}
            <path d="M 1440 115 H 1170 V 185 H 1030 V 145" />
            <path d="M 1440 185 H 1295 V 265 H 1110 V 185" />
            <path d="M 1355 115 V 185" />
            <path d="M 1170 115 V 62 H 1060" />
            <path d="M 1060 62 H 985 V 115" />

            {/* Upper-mid band */}
            <path d="M 1440 315 H 1210 V 258 H 1045 V 315 H 950" />
            <path d="M 1210 315 V 375 H 1090 V 315" />
            <path d="M 1295 265 V 315" />
            <path d="M 1030 145 V 258" />
            <path d="M 950 315 V 375 H 900" />

            {/* Centre-right cluster */}
            <path d="M 1440 455 H 1150 V 398 H 1005 V 455 H 910" />
            <path d="M 1150 455 V 515 H 1270 V 455" />
            <path d="M 1270 515 V 572 H 1125 V 515" />
            <path d="M 1090 375 V 455" />
            <path d="M 1355 455 V 515" />
            <path d="M 910 398 V 455" />

            {/* Lower-mid band */}
            <path d="M 1440 615 H 1235 V 672 H 1070 V 615 H 952" />
            <path d="M 1235 615 V 558 H 1125 V 615" />
            <path d="M 1332 572 V 615" />
            <path d="M 1070 615 V 695 H 1192 V 615" />
            <path d="M 952 615 V 695" />

            {/* Lower cluster */}
            <path d="M 1440 758 H 1175 V 818 H 1032" />
            <path d="M 1440 818 H 1298 V 758" />
            <path d="M 1175 758 V 695" />
            <path d="M 1298 818 V 858 H 1152 V 818" />
            <path d="M 1032 818 V 858" />
          </g>

          <g stroke="#a78bfa" strokeWidth="0.4" fill="none" opacity="0.11">
            <path d="M 1398 185 V 315" />
            <path d="M 1255 265 H 1210" />
            <path d="M 1005 398 V 455" />
            <path d="M 1125 515 V 558" />
            <path d="M 1235 672 V 758" />
            <path d="M 1070 695 V 758" />
            <path d="M 952 375 V 455" />
            <path d="M 1402 455 V 515" />
            <path d="M 1192 695 V 758" />
          </g>

          {/* Junction pads */}
          <g fill="#a78bfa" opacity="0.28">
            <circle cx="1170" cy="115" r="2.5" />
            <circle cx="1170" cy="185" r="2" />
            <circle cx="1030" cy="185" r="2.5" />
            <circle cx="1295" cy="185" r="2" />
            <circle cx="1295" cy="265" r="2" />
            <circle cx="1060" cy="62"  r="2" />
            <circle cx="1355" cy="185" r="1.5" />
            <circle cx="1210" cy="315" r="2.5" />
            <circle cx="1045" cy="315" r="2" />
            <circle cx="1210" cy="375" r="2" />
            <circle cx="1090" cy="375" r="1.5" />
            <circle cx="1150" cy="455" r="2.5" />
            <circle cx="1005" cy="455" r="2" />
            <circle cx="1270" cy="515" r="2" />
            <circle cx="1125" cy="515" r="2" />
            <circle cx="1235" cy="615" r="2.5" />
            <circle cx="1070" cy="615" r="2" />
            <circle cx="1192" cy="615" r="1.5" />
            <circle cx="1175" cy="758" r="2.5" />
            <circle cx="1298" cy="818" r="2" />
            <circle cx="1175" cy="695" r="1.5" />
            <circle cx="952"  cy="695" r="1.5" />
          </g>

          {/* Glowing accent nodes */}
          <g fill="#c084fc" filter="url(#ebNodeGlow)" opacity="0.35">
            <circle cx="1170" cy="185" r="3.5" />
            <circle cx="1150" cy="455" r="4" />
            <circle cx="1235" cy="615" r="3.5" />
            <circle cx="1045" cy="258" r="3" />
            <circle cx="1270" cy="515" r="3" />
          </g>
        </g>
      </svg>
    </div>
  );
}
