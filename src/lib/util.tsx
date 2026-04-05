import {useMemo} from "react";

export function useSpotGradient(
    colors: string[] | null,
    count = 10
): string {
    return useMemo(() => {
        if (!colors || colors.length < 2) return "";
        return Array(count)
            .fill(0)
            .map(() => {
                const x     = Math.random() * 100;
                const y     = Math.random() * 100;
                const size  = Math.random() * 30 + 10;
                const color = colors[Math.floor(Math.random() * colors.length)];
                return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${size}%)`;
            })
            .join(",");
    }, [colors, count]);
}
