import type { ContractQuote, EventSummary } from '../src/lib/schemas';
import { parseMarketIds } from './quoteMapping';

export type EventCategory =
  | 'all'
  | 'football'
  | 'horse_racing'
  | 'greyhound_racing'
  | 'tennis'
  | 'basketball'
  | 'baseball'
  | 'politics';

const eventCategories: EventCategory[] = [
  'all',
  'football',
  'horse_racing',
  'greyhound_racing',
  'tennis',
  'basketball',
  'baseball',
  'politics',
];

export function parseEventCategory(value: unknown): EventCategory {
  return typeof value === 'string' && eventCategories.includes(value as EventCategory) ? (value as EventCategory) : 'all';
}

type MockEvent = EventSummary & { category: EventCategory };

function futureDate(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

const mockEvents: MockEvent[] = [
  {
    id: 'demo-arsenal-chelsea',
    name: 'Arsenal vs Chelsea',
    category: 'football',
    type: 'football_match',
    state: 'upcoming',
    startDateTime: futureDate(4),
    markets: [
      {
        id: 'demo-football-winner',
        name: 'Match winner',
        state: 'open',
        contracts: [
          { id: 'demo-arsenal', name: 'Arsenal' },
          { id: 'demo-draw', name: 'Draw' },
          { id: 'demo-chelsea', name: 'Chelsea' },
        ],
      },
      {
        id: 'demo-football-goals',
        name: 'Total goals 2.5',
        state: 'open',
        contracts: [
          { id: 'demo-over-25', name: 'Over 2.5' },
          { id: 'demo-under-25', name: 'Under 2.5' },
        ],
      },
    ],
  },
  {
    id: 'demo-tennis-final',
    name: 'London Open Final',
    category: 'tennis',
    type: 'tennis_match',
    state: 'upcoming',
    startDateTime: futureDate(9),
    markets: [
      {
        id: 'demo-tennis-winner',
        name: 'Match winner',
        state: 'open',
        contracts: [
          { id: 'demo-player-a', name: 'Alex Morgan' },
          { id: 'demo-player-b', name: 'Jamie Reid' },
        ],
      },
      {
        id: 'demo-tennis-sets',
        name: 'Total sets 2.5',
        state: 'open',
        contracts: [
          { id: 'demo-sets-over', name: 'Over 2.5' },
          { id: 'demo-sets-under', name: 'Under 2.5' },
        ],
      },
    ],
  },
  {
    id: 'demo-racing-cup',
    name: 'Newmarket Autumn Cup',
    category: 'horse_racing',
    type: 'horse_racing_race',
    state: 'upcoming',
    startDateTime: futureDate(2),
    markets: [
      {
        id: 'demo-racing-winner',
        name: 'Winner',
        state: 'open',
        contracts: [
          { id: 'demo-runner-one', name: 'Northern Light' },
          { id: 'demo-runner-two', name: 'Silver Comet' },
          { id: 'demo-runner-three', name: 'Green Horizon' },
        ],
      },
    ],
  },
  {
    id: 'demo-basketball',
    name: 'London Lions vs Manchester Giants',
    category: 'basketball',
    type: 'basketball_match',
    state: 'upcoming',
    startDateTime: futureDate(26),
    markets: [
      {
        id: 'demo-basketball-winner',
        name: 'Moneyline',
        state: 'open',
        contracts: [
          { id: 'demo-lions', name: 'London Lions' },
          { id: 'demo-giants', name: 'Manchester Giants' },
        ],
      },
    ],
  },
  {
    id: 'demo-greyhound',
    name: 'Romford Evening Race 6',
    category: 'greyhound_racing',
    type: 'greyhound_racing_race',
    state: 'upcoming',
    startDateTime: futureDate(3),
    markets: [
      {
        id: 'demo-greyhound-winner',
        name: 'Winner',
        state: 'open',
        contracts: [
          { id: 'demo-greyhound-one', name: 'Rapid Rocket' },
          { id: 'demo-greyhound-two', name: 'Midnight Dash' },
          { id: 'demo-greyhound-three', name: 'Lucky Lane' },
        ],
      },
    ],
  },
  {
    id: 'demo-baseball',
    name: 'New York vs Boston',
    category: 'baseball',
    type: 'baseball_match',
    state: 'upcoming',
    startDateTime: futureDate(31),
    markets: [
      {
        id: 'demo-baseball-winner',
        name: 'Moneyline',
        state: 'open',
        contracts: [
          { id: 'demo-new-york', name: 'New York' },
          { id: 'demo-boston', name: 'Boston' },
        ],
      },
    ],
  },
  {
    id: 'demo-politics',
    name: 'Next UK General Election',
    category: 'politics',
    type: 'politics_general_election',
    state: 'upcoming',
    startDateTime: futureDate(24 * 30),
    markets: [
      {
        id: 'demo-politics-party',
        name: 'Most seats',
        state: 'open',
        contracts: [
          { id: 'demo-labour', name: 'Labour' },
          { id: 'demo-conservative', name: 'Conservative' },
          { id: 'demo-other-party', name: 'Other' },
        ],
      },
    ],
  },
];

const basePrices = new Map(
  mockEvents.flatMap((event) =>
    event.markets.flatMap((market, marketIndex) =>
      market.contracts.map((contract, contractIndex) => [contract.id, 2200 + marketIndex * 450 + contractIndex * 1250] as const),
    ),
  ),
);

export function fetchMockEvents(category: EventCategory) {
  return {
    events: mockEvents
      .filter((event) => category === 'all' || event.category === category)
      .map(({ category: _category, ...event }) => event),
    fetchedAt: new Date().toISOString(),
    category,
  };
}

export function fetchMockEventDetail(eventId: string) {
  const match = mockEvents.find((event) => event.id === eventId);
  if (!match) return null;

  const { category: _category, ...event } = match;
  return { event, fetchedAt: new Date().toISOString() };
}

function quoteFor(contractId: string, tick: number): ContractQuote {
  const base = basePrices.get(contractId) ?? 5000;
  const seed = [...contractId].reduce((total, character) => total + character.charCodeAt(0), 0);
  const movement = Math.round(Math.sin(tick / 2 + seed) * 90);
  const lastTradedPrice = Math.max(250, Math.min(9500, base + movement));
  const spread = 35;

  return {
    contractId,
    bestBackPrice: lastTradedPrice + spread,
    bestLayPrice: lastTradedPrice - spread,
    bids: [0, 1, 2].map((level) => ({
      price: lastTradedPrice - spread - level * 25,
      quantity: 75_000 + ((seed + tick * 137 + level * 29) % 90_000),
    })),
    offers: [0, 1, 2].map((level) => ({
      price: lastTradedPrice + spread + level * 25,
      quantity: 70_000 + ((seed + tick * 113 + level * 31) % 95_000),
    })),
    lastTradedPrice,
    lastTradedAt: new Date().toISOString(),
  };
}

export function fetchMockQuotes(input: unknown) {
  const marketIds = new Set(parseMarketIds(input));
  const contractIds = mockEvents.flatMap((event) =>
    event.markets.filter((market) => marketIds.has(market.id)).flatMap((market) => market.contracts.map((contract) => contract.id)),
  );
  const tick = Math.floor(Date.now() / 5000);

  return {
    contracts: contractIds.map((contractId) => quoteFor(contractId, tick)),
    fetchedAt: new Date().toISOString(),
  };
}
