export const colors = {
  // Backgrounds
  background: '#0a1a0a',
  surface: '#111111',
  surfaceRaised: '#1c1c1c',

  // Cards — realistic white
  cardFace: '#ffffff',
  cardBorder: '#cccccc',
  cardBorderHeld: '#2aaa2a',
  cardBorderShamrock: '#2aaa2a',

  // Traditional suit colors
  hearts: '#cc0000',
  diamonds: '#cc0000',
  clubs: '#111111',
  spades: '#111111',
  joker: '#c9a84c',

  // Casino accent palette
  gold: '#c9a84c',
  goldBright: '#e8c56a',
  crimson: '#8b0000',

  // Buttons
  buttonDeal: '#7a0000',
  buttonDealBorder: '#bb2222',
  buttonBet: '#0a0a4a',
  buttonBetBorder: '#2244aa',

  // Text
  textPrimary: '#f5e6c8',
  textDim: '#7a6a50',
  textGold: '#c9a84c',

  // Badges
  holdBadge: '#2aaa2a',
  holdBadgeText: '#ffffff',
  winBanner: '#c9a84c',
  winBannerText: '#111111',

  // Mode accent colors — muted, not neon
  neonCyan: '#3399cc',
  neonGold: '#c9a84c',
  neonPink: '#cc2255',
  neonOrange: '#cc6600',
  neonGreen: '#2aaa2a',
  shamrockGreen: '#2a8a2a',
  neonRed: '#cc2222',
};

export const fonts = {
  retro: 'PressStart2P',
  mono: 'monospace',
};

// Realistic shadows — no neon glow
export const glow = {
  cyan: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  green: {
    shadowColor: '#1a5c1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 6,
  },
  gold: {
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  red: {
    shadowColor: '#880000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
};
