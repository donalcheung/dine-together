export type UpdatePlatform = 'app' | 'web' | 'both'

export type ProductUpdate = {
  title: string
  description: string
  platform?: UpdatePlatform
}

export type UpdateRelease = {
  /** ISO date for sorting (YYYY-MM-DD) */
  date: string
  displayDate: string
  items: ProductUpdate[]
}

/**
 * Product updates sourced from TableMeshNative + dine-together git history.
 * Add new entries at the top when shipping features.
 */
export const productUpdates: UpdateRelease[] = [
  {
    date: '2026-05-16',
    displayDate: 'May 16, 2026',
    items: [
      {
        title: 'TableMesh vs Timeleft vs Meetup blog post',
        description:
          'Published an honest comparison of how TableMesh, Timeleft, and Meetup each approach social dining — and who each is best for.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-05-15',
    displayDate: 'May 15, 2026',
    items: [
      {
        title: 'Ad hoc group chats & voice messages',
        description:
          'Start group chats for any meal and send voice messages in-thread — handy when you are coordinating on the go.',
        platform: 'app',
      },
      {
        title: 'Event fees with Venmo',
        description:
          'Hosts can collect event fees via Venmo with separate host confirmation, so paid experiences are clearer for everyone.',
        platform: 'app',
      },
      {
        title: 'Planning wizard restored',
        description:
          'Brought back the meal planning wizard with host approval, social profiles, and group join-code UI after a recovery merge.',
        platform: 'app',
      },
      {
        title: 'Web guest RSVP security',
        description:
          'Database migrations and RLS policies tightened for guest RSVPs coming from the web.',
        platform: 'both',
      },
    ],
  },
  {
    date: '2026-05-14',
    displayDate: 'May 14, 2026',
    items: [
      {
        title: 'Guest-to-account conversion',
        description:
          'Guests who RSVP on the web can now convert their RSVP into a full TableMesh account without starting over.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-05-13',
    displayDate: 'May 13, 2026',
    items: [
      {
        title: 'About Us page',
        description:
          'Added a founder story page explaining why TableMesh exists and our commitment to keeping core features free.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-05-09',
    displayDate: 'May 9, 2026',
    items: [
      {
        title: 'iOS performance parity',
        description:
          'Restored production-level iOS performance and cleaned up the My Meals action layout.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-05-08',
    displayDate: 'May 8, 2026',
    items: [
      {
        title: 'TableMates & My Meals overhaul',
        description:
          'Major navigation and caching improvements, a refreshed TableMates experience, and a fix for web RSVPs syncing into the app.',
        platform: 'both',
      },
    ],
  },
  {
    date: '2026-05-05',
    displayDate: 'May 5, 2026',
    items: [
      {
        title: 'Dining invites fixed end-to-end',
        description:
          'Invites now send reliably, and My Meals has a dedicated Invites tab so nothing gets lost in chat.',
        platform: 'app',
      },
      {
        title: 'Download & verification fixes',
        description:
          'Fixed broken download links across the site and the email verification deep link.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-04-26',
    displayDate: 'April 26, 2026',
    items: [
      {
        title: 'Guest reminder cron on Supabase',
        description:
          'Moved guest meal reminders from Vercel to a Supabase Edge Function for more reliable scheduling.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-04-25',
    displayDate: 'April 25, 2026',
    items: [
      {
        title: 'Referral flow complete',
        description:
          'Referral codes copy to clipboard on share, capture on first launch, prompt during onboarding, and offer a 7-day settings fallback.',
        platform: 'both',
      },
      {
        title: 'Web guest RSVPs in the host app',
        description:
          'Hosts see web guest RSVPs in-app and can approve or decline them without leaving TableMesh.',
        platform: 'both',
      },
      {
        title: 'Improved /dine invite pages',
        description:
          'Richer meal detail pages for guests, referral codes on share links, and a smoother guest notification flow.',
        platform: 'web',
      },
      {
        title: 'Notification badge fixes',
        description:
          'Bell and iOS home-screen badges clear immediately after you read notifications.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-23',
    displayDate: 'April 23, 2026',
    items: [
      {
        title: 'Places photo enrichment',
        description:
          'A new edge function enriches restaurant photos from Google Places so meal cards and detail screens look better.',
        platform: 'both',
      },
      {
        title: 'TableMates photo carousel',
        description:
          'Swipe through multiple photos on TableMates cards, with a prompt to add more profile photos.',
        platform: 'app',
      },
      {
        title: 'Faster image loading',
        description:
          'Fixed stale closures, added prefetch and CachedImage, and improved retry logic for dining request photos.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-16',
    displayDate: 'April 16, 2026',
    items: [
      {
        title: 'My Meals refresh & Android fixes',
        description:
          'My Meals now refreshes reliably; fixed five Android bugs including disappearing messages and map filter issues.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-14',
    displayDate: 'April 14, 2026',
    items: [
      {
        title: 'Groups member counts fixed',
        description:
          'Group member counts now pull live data from group_members, and groups load consistently again.',
        platform: 'app',
      },
      {
        title: 'Account deletion reliability',
        description:
          'Fixed account deletion failing after a Supabase schema update.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-09',
    displayDate: 'April 9, 2026',
    items: [
      {
        title: 'Calendar view in My Meals',
        description:
          'Browse upcoming and past meals in a calendar layout alongside the list view.',
        platform: 'app',
      },
      {
        title: 'Optional meal titles',
        description:
          'Give your dining requests a custom title — great for “Team lunch” or “KBBQ night”.',
        platform: 'app',
      },
      {
        title: 'SMS download links',
        description:
          'Phone-gated download flow sends an App Store link via SMS (with proper consent disclosure).',
        platform: 'web',
      },
      {
        title: 'Notification audit fixes',
        description:
          'Closed gaps found in a notification-system audit so fewer alerts slip through the cracks.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-04',
    displayDate: 'April 4, 2026',
    items: [
      {
        title: 'Profile & onboarding scroll fixes',
        description:
          'Fixed scroll blocking on Profile and Onboarding screens on smaller devices.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-04-01',
    displayDate: 'April 1, 2026',
    items: [
      {
        title: 'Promo code redemption',
        description:
          'Redeem promo codes directly from the paywall.',
        platform: 'app',
      },
      {
        title: 'Weekly profile view limits',
        description:
          'Replaced the daily wave counter with weekly profile view limits for a fairer TableMates experience.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-03-31',
    displayDate: 'March 31, 2026',
    items: [
      {
        title: 'Phone-gated downloads',
        description:
          'Download buttons unlock after an optional phone number; SMS still works even if Twilio hiccups.',
        platform: 'web',
      },
    ],
  },
  {
    date: '2026-03-28',
    displayDate: 'March 28, 2026',
    items: [
      {
        title: 'Smarter Discover feed',
        description:
          'Restaurant requests interleave more intelligently, with scrollable discount filter chips on the dashboard.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-03-18',
    displayDate: 'March 18, 2026',
    items: [
      {
        title: 'Auto-detect cuisine & price',
        description:
          'When you pick a restaurant, cuisine type and price range are inferred from Google Places.',
        platform: 'app',
      },
      {
        title: 'TableMates filter in top bar',
        description:
          'Filters and wave counter moved into the top bar for quicker browsing on Discover.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-03-14',
    displayDate: 'March 14, 2026',
    items: [
      {
        title: 'Check-in redesign',
        description:
          'New arrival status buttons, auto-complete for finished meals, and host no-show tagging.',
        platform: 'app',
      },
      {
        title: 'Atomic moderation actions',
        description:
          'Block, report, and flag actions now use atomic Supabase RPCs for safer moderation.',
        platform: 'app',
      },
    ],
  },
  {
    date: '2026-03-13',
    displayDate: 'March 13, 2026',
    items: [
      {
        title: 'App Store review compliance',
        description:
          'Crash-proof RevenueCat integration, clearer IAP visibility, and demo-data handling for review.',
        platform: 'app',
      },
    ],
  },
]

export const platformLabels: Record<UpdatePlatform, string> = {
  app: 'App',
  web: 'Web',
  both: 'App & Web',
}
