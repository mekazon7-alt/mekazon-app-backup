/**
 * AfricaSVG — Outline of the African continent
 * Use for "Show Me Everything" option on onboarding
 */
import React from "react";
import Svg, { Path, G } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function AfricaContinent({ size = 40, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 120">
      <Path
        d="M50 5 C42 5, 34 8, 28 12 C22 16, 18 22, 15 28 C12 34, 10 40, 10 46 
           C10 50, 11 54, 12 57 C8 60, 6 65, 6 70 C6 76, 9 82, 14 86 
           C18 90, 20 94, 22 98 C24 102, 26 106, 30 109 C34 112, 38 114, 42 115
           C46 116, 50 116, 54 115 C60 113, 66 108, 70 103
           C74 98, 76 92, 80 88 C84 84, 88 80, 90 75
           C92 70, 92 64, 90 59 C88 54, 84 50, 88 45
           C90 42, 92 38, 90 34 C88 30, 84 27, 80 25
           C76 22, 72 18, 68 14 C64 10, 58 5, 50 5 Z"
        fill={color}
        opacity={0.9}
      />
      {/* Madagascar */}
      <Path
        d="M88 58 C86 55, 84 54, 83 56 C82 60, 82 66, 83 70
           C84 74, 86 75, 88 73 C90 70, 90 64, 88 58 Z"
        fill={color}
        opacity={0.8}
      />
    </Svg>
  );
}

export function WestAfricaMap({ size = 40, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 80">
      <Path
        d="M10 15 C14 10, 20 8, 26 8 C32 8, 36 10, 40 10
           C44 10, 48 8, 52 8 C58 8, 64 10, 70 12
           C76 14, 82 16, 86 20 C90 24, 90 30, 88 36
           C86 42, 82 46, 78 50 C74 54, 70 56, 66 60
           C62 64, 58 68, 54 70 C50 72, 46 72, 42 70
           C38 68, 34 64, 30 60 C26 56, 22 52, 18 48
           C14 44, 10 40, 8 35 C6 30, 6 24, 8 20
           C9 18, 10 16, 10 15 Z"
        fill={color}
        opacity={0.9}
      />
      {/* Cape Verde islands hint */}
      <Path
        d="M4 30 C3 29, 2 29, 2 30 C2 31, 3 32, 4 31 Z"
        fill={color}
        opacity={0.6}
      />
    </Svg>
  );
}