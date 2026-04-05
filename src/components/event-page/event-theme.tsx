import { ComponentProps, useMemo } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_EVENT_THEME, EventThemeColors } from "@/lib/event-theme";

interface EventThemeSelectorProps extends ComponentProps<"div"> {
    currentEventTheme: EventThemeColors;
    setEventTheme: (newEventTheme: EventThemeColors) => void
}

interface EventThemeType {
    colors: EventThemeColors;
    name: string;
    vibe: string;
}

const eventThemes: EventThemeType[] = [
    {
        colors: DEFAULT_EVENT_THEME,
        name: 'Drifto Classic',
        vibe: 'Clean and versatile',
    },
    {
        colors: ['#833ab4', '#fd1d1d'],
        name: 'Neon Vibes',
        vibe: 'Party / night energy',
    },
    {
        colors: ['#FF7E5F', '#FEB47B'],
        name: 'Festival Glow',
        vibe: 'Lively, celebratory, joyful',
    },
    {
        colors: ['#FBD3E9', '#BB377D'],
        name: 'Bloom Pop',
        vibe: 'Artistic, social, playful',
    },
    {
        colors: ['#FFD194', '#D1913C'],
        name: 'Golden Hour',
        vibe: 'Warm, glowing, cinematic',
    },
    {
        colors: ['#ffecd2', '#fcb69f'],
        name: 'Soft Escape',
        vibe: 'Scenic, lifestyle, cozy',
    },
    {
        colors: ['#fceabb', '#f8b500'],
        name: 'Honey Glow',
        vibe: 'Cozy, warm, inviting',
    },
    {
        colors: ['#ee9ca7', '#ffdde1'],
        name: 'Rose Drift',
        vibe: 'Romantic, gentle, inviting',

    },
    {
        colors: ['#96fbc4', '#f9f586'],
        name: 'Fresh Calm',
        vibe: 'Relax, growth, flow',
    },
    {
        colors: ['#d4fc79', '#96e6a1'],
        name: 'Meadow Fresh',
        vibe: 'Natural, lively, outdoorsy',
    },
    {
        colors: ['#43cea2', '#4c7ba9ff'],
        name: 'Ocean Flow',
        vibe: 'Calm, refreshing, steady',
    },
    {
        colors: ['#1FA2FF', '#12D8FA', '#A6FFCB'],
        name: 'Sky Surge',
        vibe: 'Uplifting, breezy, inspiring',
    },
    {
        colors: ['#e1eec3', '#f05053'],
        name: 'Soul Glow',
        vibe: 'Warm, heartfelt, real',
    },
    {
        colors: ['#3CA55C', '#B5AC49'],
        name: 'Green Thought',
        vibe: 'Smart, earthy, balanced',
    },
    {
        colors: ['#e1eec3', '#f05053'],
        name: 'Kind Flame',
        vibe: 'Giving, comfort, homey',
    },
    {
        colors: ['#00C9FF', '#92FE9D'],
        name: 'Mint Wave',
        vibe: 'Modern, fresh, lively',
    },
    {
        colors: ['#e0c3fc', '#8ec5fc'],
        name: 'Heaven’s Glow',
        vibe: 'Peaceful, radiant, inspiring',
    },
    {
        colors: ['#5fafffff', '#bdc3c7'],
        name: 'Silver Screen',
        vibe: 'Cinematic, timeless, classy',
    },
];

export const EventThemeSelector = ({
    currentEventTheme, setEventTheme, className, ...props
}: EventThemeSelectorProps) => {

    const eqArrValue = (a: string[], b: string[]) =>
        a.length === b.length &&
        a.every((color, index) => color.toLowerCase() === b[index]?.toLowerCase());

    const orderedThemes = useMemo(() => {
        const colorIndex = eventThemes.findIndex((item) => eqArrValue(item.colors, currentEventTheme));

        if (colorIndex <= 0) {
            return eventThemes;
        }

        return [
            eventThemes[colorIndex],
            ...eventThemes.slice(0, colorIndex),
            ...eventThemes.slice(colorIndex + 1),
        ];
    }, [currentEventTheme]);

    const handleClick = (item: EventThemeType) => {
        setEventTheme(item.colors)
    }

    return (
        <div
            className={cn(
                "w-full overflow-x-auto flex gap-4 no-scrollbar",
                className
            )}
            {...props}
        >
            {orderedThemes.map((item, index) => (
                <div
                    key={index}
                    className={`flex flex-col justify-center px-4 py-5 rounded-md w-40 shrink-0 cursor-pointer border-2 transition-colors ${item.name === "Drifto Classic" ? "text-black" : "text-white"} ${eqArrValue(item.colors, currentEventTheme) ? "border-neutral-950 dark:border-blue-500" : "border-white/70"}`}
                    style={{
                        background: `linear-gradient(to right, ${item.colors.join(', ')})`,
                    }}
                    onClick={() => handleClick(item)}
                >
                    <p className="text-sm font-black">{item.name}</p>
                    <p className=" text-xs">{item.vibe}</p>
                </div>
            ))}
        </div>
    )
}
