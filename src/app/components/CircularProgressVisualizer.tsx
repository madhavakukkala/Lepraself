'use client';

import React from 'react';

interface CircularProgressProps {
  solvedEasy: number;
  totalEasy: number;
  solvedMedium: number;
  totalMedium: number;
  solvedHard: number;
  totalHard: number;
}

export function CircularProgressVisualizer({
  solvedEasy,
  totalEasy,
  solvedMedium,
  totalMedium,
  solvedHard,
  totalHard,
}: CircularProgressProps) {
  const totalSolved = solvedEasy + solvedMedium + solvedHard;
  const totalProblems = totalEasy + totalMedium + totalHard;
  const overallPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  // SVG parameters
  const size = 260;
  const strokeWidth = 14;
  const center = size / 2;
  
  // Radii for three nested rings
  const rEasy = 110;
  const rMedium = 90;
  const rHard = 70;

  const getCircumference = (r: number) => 2 * Math.PI * r;
  
  const getStrokeDash = (solved: number, total: number, r: number) => {
    const circ = getCircumference(r);
    const percentage = total > 0 ? solved / total : 0;
    const strokeDashoffset = circ - percentage * circ;
    return {
      strokeDasharray: `${circ} ${circ}`,
      strokeDashoffset,
    };
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 p-6 bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow">
      {/* Interactive Nested SVG rings */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Easy Back/Front */}
          <circle
            cx={center}
            cy={center}
            r={rEasy}
            className="stroke-[#EAEAEA] dark:stroke-[#222222]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={rEasy}
            className="stroke-[#4ADE80] transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            {...getStrokeDash(solvedEasy, totalEasy, rEasy)}
          />

          {/* Medium Back/Front */}
          <circle
            cx={center}
            cy={center}
            r={rMedium}
            className="stroke-[#EAEAEA] dark:stroke-[#222222]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={rMedium}
            className="stroke-[#F59E0B] transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            {...getStrokeDash(solvedMedium, totalMedium, rMedium)}
          />

          {/* Hard Back/Front */}
          <circle
            cx={center}
            cy={center}
            r={rHard}
            className="stroke-[#EAEAEA] dark:stroke-[#222222]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={rHard}
            className="stroke-[#EF4444] transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            {...getStrokeDash(solvedHard, totalHard, rHard)}
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight">{totalSolved}</span>
          <span className="text-[var(--muted)] text-sm mt-1">/ {totalProblems} solved</span>
          <div className="mt-2 px-2.5 py-0.5 bg-[var(--background)] border border-[var(--border)] text-xs font-semibold rounded-full">
            {overallPercentage}% Done
          </div>
        </div>
      </div>

      {/* Legend & Stats Details */}
      <div className="flex flex-col gap-4 w-full md:w-48">
        <div>
          <div className="flex items-center justify-between text-sm font-semibold mb-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4ADE80]" />
              <span>Easy</span>
            </div>
            <span>{solvedEasy} / {totalEasy}</span>
          </div>
          <div className="w-full bg-[#EAEAEA] dark:bg-[#222222] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#4ADE80] h-full transition-all duration-500" 
              style={{ width: `${totalEasy > 0 ? (solvedEasy / totalEasy) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-semibold mb-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span>Medium</span>
            </div>
            <span>{solvedMedium} / {totalMedium}</span>
          </div>
          <div className="w-full bg-[#EAEAEA] dark:bg-[#222222] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#F59E0B] h-full transition-all duration-500" 
              style={{ width: `${totalMedium > 0 ? (solvedMedium / totalMedium) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-semibold mb-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span>Hard</span>
            </div>
            <span>{solvedHard} / {totalHard}</span>
          </div>
          <div className="w-full bg-[#EAEAEA] dark:bg-[#222222] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#EF4444] h-full transition-all duration-500" 
              style={{ width: `${totalHard > 0 ? (solvedHard / totalHard) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
