import {Metadata} from 'next'
import {notFound, redirect} from 'next/navigation'
import {headers} from 'next/headers'
import {api} from "@/lib/axios";
import {Linkify} from "@/lib/linkify";
import Image from "next/image";

interface Event {
    slug: string;
    id: string,
    title: string,
    description: string,
    startTime: Date,
    titleFileUrl: string,
    original: boolean,
    featured: boolean
}

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Server-side fetch without auth (for bots and crawlers)
async function getPublicEvent(eventId: string): Promise<Event | null> {
    try {
        const response = await api.get(`/event/public/${eventId}/meta`)
        return response.data.data
    } catch (error) {
        console.error('Failed to fetch public event:', error)
        return null
    }
}

// Optimize Cloudinary image for social sharing
function optimizeCloudinaryUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url || '/createeventpic.jpg'
    }

    // Add social media optimizations: 1200x630, auto format, auto quality
    return url.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_auto,q_auto/')
}

// Helper function to safely convert searchParams to query string
function createQueryString(searchParams: { [key: string]: string | string[] | undefined }): string {
    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                // Handle array values by adding each value separately
                value.forEach(v => params.append(key, v))
            } else {
                // Handle single string values
                params.set(key, value)
            }
        }
    })

    return params.toString()
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const event = await getPublicEvent(id)
    if (!event) return { title: 'Event Not Found', description: 'The requested event could not be found.' }
    const optimizedImage = optimizeCloudinaryUrl(event.titleFileUrl)
    const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/m/events/${event.slug}`


    return {
        title: `${event.title.toUpperCase()} | Drifto`,
        description: event.description || `Join us for ${event.title} on ${new Date(event.startTime).toLocaleDateString()}`,
        authors: [{name: "Drifto", url: process.env.NEXT_PUBLIC_BASE_URL}],

        openGraph: {
            title: event.title.toUpperCase(),
            description: event.description || `Join us for ${event.title}`,
            type: 'website',
            url: eventUrl,
            images: [{ url: optimizedImage, width: 1200, height: 630, alt: event.title }],
            locale: 'en_US',
            siteName: 'Drifto',
        },

        twitter: {
            card: 'summary_large_image',
            title: event.title.toUpperCase(),
            description: event.description || `Join us for ${event.title}`,
            images: [optimizedImage],
            site: "@drifto",
        }
        ,
        alternates: { canonical: eventUrl },
        other: { 'event:start_time': new Date(event.startTime).toLocaleDateString() },
    }
}

// Check if request is from a bot/crawler
function isBotRequest(userAgent: string): boolean {
    const botPatterns = [
        // Major search engines
        'googlebot',
        'bingbot',
        'slurp',                    // Yahoo
        'duckduckbot',              // DuckDuckGo
        'baiduspider',              // Baidu
        'yandexbot',                // Yandex
        'sogou',                    // Sogou
        'exabot',                   // Exalead
        'applebot',                 // Apple

        // Social media platforms
        'facebookexternalhit',      // Facebook
        'facebookcatalog',          // Facebook Catalog
        'twitterbot',               // Twitter/X
        'linkedinbot',              // LinkedIn
        'pinterestbot',             // Pinterest
        'redditbot',                // Reddit
        'tumblr',                   // Tumblr
        'instagrambot',             // Instagram
        'snapchatbot',              // Snapchat
        'tiktokbot',                // TikTok
        'youtubebot',               // YouTube

        // Messaging platforms
        'whatsapp',                 // WhatsApp
        'telegrambot',              // Telegram
        'skypebot',                 // Skype
        'viberbot',                 // Viber
        'linebot',                  // Line
        'wechatbot',                // WeChat
        'kakaobot',                 // KakaoTalk
        'signalbot',                // Signal

        // Business/Professional platforms
        'slackbot',                 // Slack
        'microsoftteams',           // Microsoft Teams
        'discordbot',               // Discord
        'zoombot',                  // Zoom
        'mattermost',               // Mattermost
        'rocketbot',                // Rocket.Chat

        // Other social/media platforms
        'mastodonbot',              // Mastodon
        'blueskybot',               // Bluesky
        'threadsbot',               // Threads
        'clubhousebot',             // Clubhouse
        'spotifybot',               // Spotify
        'soundcloudbot',            // SoundCloud
        'vimeobot',                 // Vimeo
        'dailymotionbot',           // Dailymotion
        'flickrbot',                // Flickr
        '500pxbot',                 // 500px
        'behancebot',               // Behance
        'dribbblebot',              // Dribbble
        'deviantartbot',            // DeviantArt
        'artstation',               // ArtStation

        // News and content platforms
        'flipboard',                // Flipboard
        'pocket',                   // Pocket
        'mediumbot',                // Medium
        'substack',                 // Substack
        'wordpressbot',             // WordPress.com
        'ghostbot',                 // Ghost

        // E-commerce and marketplace
        'shopifybot',               // Shopify
        'woocommercebot',           // WooCommerce
        'etsybot',                  // Etsy
        'amazonbot',                // Amazon
        'ebaybot',                  // eBay

        // Regional social platforms
        'weibobot',                 // Weibo (China)
        'qzonebot',                 // QZone (China)
        'renrenbot',                // Renren (China)
        'vkontaktebot',             // VKontakte (Russia)
        'odnoklassnikibot',         // Odnoklassniki (Russia)
        'mixibot',                  // Mixi (Japan)
        'orkutbot',                 // Orkut (Brazil/India - discontinued but may still crawl)
        'cyworld',                  // Cyworld (South Korea)

        // Developer and tech platforms
        'githubbot',                // GitHub
        'gitlabbot',                // GitLab
        'bitbucketbot',             // Bitbucket
        'stackoverflowbot',         // Stack Overflow
        'hackerrank',               // HackerRank
        'codepen',                  // CodePen
        'jsfiddlebot',              // JSFiddle

        // Generic bot patterns
        'bot/',                     // Generic bot pattern
        'crawler',                  // Generic crawler
        'spider',                   // Generic spider
        'scraper',                  // Generic scraper
        'fetcher',                  // Generic fetcher
        'parser',                   // Generic parser
        'preview',                  // Link preview generators
        'unfurling',                // URL unfurling
        'meta-externalagent',       // Meta's external agent
        'embed',                    // Embed generators

        // SEO and monitoring tools
        'semrushbot',               // SEMrush
        'ahrefsbot',                // Ahrefs
        'screaming frog',           // Screaming Frog SEO
        'moz.com',                  // Moz
        'majestic',                 // Majestic SEO
        'uptimerobot',              // UptimeRobot
        'pingdom',                  // Pingdom
        'statuscake',               // StatusCake
        'newrelic',                 // New Relic Synthetics

        // Archive and research
        'archive.org',              // Internet Archive
        'waybackmachine',           // Wayback Machine
        'commoncrawl',              // Common Crawl
        'researchbot',              // Research bots
        'academicbot',              // Academic crawlers

        // Security scanners (that might need metadata)
        'qualys',                   // Qualys
        'nessus',                   // Nessus
        'openvas',                  // OpenVAS
        'burpsuite',                // Burp Suite
    ]

    const lowerUserAgent = userAgent.toLowerCase()
    return botPatterns.some(pattern =>
        lowerUserAgent.includes(pattern.toLowerCase())
    )
}

// Main server component
export default async function EventPage({ params, searchParams }: PageProps) {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const isBot = isBotRequest(userAgent)

    if (isBot) {
        const event = await getPublicEvent(resolvedParams.id)
        if (!event) notFound()
        return (
            <div className="min-h-[100dvh] bg-gray-50 py-8">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Event",
                            "name": event.title.toUpperCase(),
                            "description": event.description,
                            "image": optimizeCloudinaryUrl(event.titleFileUrl),
                            "startDate": new Date(event.startTime).toLocaleDateString(),
                            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/m/events/${event.id}`
                        })
                    }}
                />
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="relative h-64">
                            <Image
                                src={event.titleFileUrl}
                                alt={event.title}
                                fill
                                className="object-cover rounded-md"
                            />
                        </div>
                        <div className="p-6">
                            <h1 className="text-3xl font-bold mb-4 capitalize">{event.title}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                                <span>📅 {new Date(event.startTime).toLocaleDateString()}</span>
                            </div>
                            <Linkify text={event.description} className="text-gray-700 leading-relaxed" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const queryString = createQueryString(resolvedSearchParams)
    redirect(`/m/events/${resolvedParams.id}${queryString ? `?${queryString}` : ''}`)
}