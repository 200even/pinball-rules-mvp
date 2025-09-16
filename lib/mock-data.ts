// Mock data for development when database is not available
export const mockGames = [
  {
    id: 'mock-1',
    title: 'Attack from Mars',
    manufacturer: 'Bally',
    year: 1995,
    system: 'WPC',
    ipdb_id: 4032,
    pinside_id: 233,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
  {
    id: 'mock-2',
    title: 'Godzilla',
    manufacturer: 'Stern',
    year: 2021,
    system: 'Spike 2',
    ipdb_id: 10518,
    pinside_id: 68241,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
  {
    id: 'mock-3',
    title: 'Medieval Madness',
    manufacturer: 'Williams',
    year: 1997,
    system: 'WPC-95',
    ipdb_id: 4032,
    pinside_id: 2852,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
  {
    id: 'mock-4',
    title: 'The Twilight Zone',
    manufacturer: 'Bally',
    year: 1993,
    system: 'WPC',
    ipdb_id: 2684,
    pinside_id: 2684,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
];

export const mockRulesets = [
  {
    id: 'mock-ruleset-1',
    game_id: 'mock-1',
    rom_version: 'L-5',
    provenance: { source: 'mock_data' },
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
];

export const mockRuleSections = [
  {
    id: 'mock-section-1',
    ruleset_id: 'mock-ruleset-1',
    section_type: 'overview',
    title: 'Game Overview',
    body: 'Attack from Mars is a 1995 pinball machine manufactured by Bally. The theme revolves around defending Earth from a Martian invasion.\n\nThis is a demo version - to see the full functionality with real data, you need to set up the database services.',
    facts: { feature_type: 'overview' },
    order_idx: 0,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
  {
    id: 'mock-section-2',
    ruleset_id: 'mock-ruleset-1',
    section_type: 'multiball',
    title: 'Multiball',
    body: '### Starting Multiball\n- Complete the saucer sequence by hitting the flying saucer 5 times\n- Each hit advances the sequence: "Scan", "Beam Up Cow", "Destroy Crop", "Abduct Human", "Total Annihilation"\n- After "Total Annihilation", multiball starts with 3 balls\n\n### Multiball Scoring\n- Jackpots are lit at the center ramp and right ramp\n- Base jackpot value starts at 20 million\n- Each jackpot collected increases the value by 5 million',
    facts: { feature_type: 'multiball' },
    order_idx: 1,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01'),
  },
];

export function searchMockGames(query: string) {
  const lowerQuery = query.toLowerCase();
  return mockGames.filter(game => 
    game.title.toLowerCase().includes(lowerQuery) ||
    (game.manufacturer && game.manufacturer.toLowerCase().includes(lowerQuery))
  );
}
