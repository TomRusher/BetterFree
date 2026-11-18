import React from 'react';
import type { StoneId } from '../types/app';

const STONE_SHAPES: Record<
  StoneId,
  { colors: [string, string]; body: React.ReactNode; emblem: React.ReactNode }
> = {
  ch1: {
    colors: ['#8A9A86', '#B3C0AF'],
    body: <path d="M10 42c0-11 10-18 22-18s22 7 22 17c0 8-9 13-22 13S10 51 10 42z" />,
    emblem: <circle cx="32" cy="42" r="2.6" />,
  },
  ch4: {
    colors: ['#8A9A86', '#B3C0AF'],
    body: <path d="M14 32c0-9 8-15 18-15s18 6 18 15v12c0 6-8 10-18 10s-18-4-18-10z" />,
    emblem: <path d="M24 31h16M24 38h16M24 45h16" />,
  },
  ch7: {
    colors: ['#8A9A86', '#B3C0AF'],
    body: <path d="M12 36c0-11 9-19 20-19s20 8 20 19-9 17-20 17-20-6-20-17z" />,
    emblem: <path d="M34 20l-5 9 7 6-6 9 4 7" />,
  },
  urge: {
    colors: ['#5C7FB8', '#9DB4E0'],
    body: <path d="M9 38c0-10 10-17 23-17s23 7 23 17-10 15-23 15S9 48 9 38z" />,
    emblem: <path d="M18 38q5-7 10 0t10 0 8 0" />,
  },
  why: {
    colors: ['#5C7FB8', '#9DB4E0'],
    body: <path d="M14 34c0-9 8-16 18-16s18 7 18 16-8 18-18 18-18-9-18-18z" />,
    emblem: <path d="M32 26l7 9-7 9-7-9z" />,
  },
  week: {
    colors: ['#8A9A86', '#B3C0AF'],
    body: <path d="M10 40c0-12 10-20 22-20s22 8 22 20c0 8-10 13-22 13S10 48 10 40z" />,
    emblem: <path d="M20 44h24M26 44a6 6 0 0 1 12 0M32 31v-3M22 34l-2-2M42 34l2-2" />,
  },
};

export const StoneArt: React.FC<{ id: StoneId; unlocked: boolean }> = ({ id, unlocked }) => {
  const stone = STONE_SHAPES[id];

  if (unlocked) {
    return (
      <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16 mx-auto" aria-hidden="true">
        <g fill={stone.colors[0]}>{stone.body}</g>
        <path
          d="M17 33c3-6 9-9 15-9"
          stroke={stone.colors[1]}
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".55"
        />
        <g
          stroke="#0B0F17"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".65"
        >
          {stone.emblem}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16 mx-auto" aria-hidden="true">
      <g stroke="#3A4A66" strokeWidth="1.6" strokeDasharray="3 3">
        {stone.body}
      </g>
      <g stroke="#2A3550" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 3">
        {stone.emblem}
      </g>
    </svg>
  );
};
