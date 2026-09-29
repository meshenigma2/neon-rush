export const GAME_CONFIG = {
  engine: {
    maxDeltaSeconds: 0.1, // Clamp delta time to max 100ms
  },
  world: {
    laneWidth: 3,
    roadLength: 100, // Length of a single road segment
    visibleSegments: 4, // Number of segments to render ahead
    laneCount: 4,
  },
  gameplay: {
    defaultSpeedKph: 60,
    maxSpeedKph: 200,
    acceleration: 40,
    deceleration: 80,
    naturalDeceleration: 10,
    laneChangeSpeed: 10,
  },
  traffic: {
    poolSize: 20, // Max concurrent traffic cars
    spawnDistanceMeters: 150, // Spawn ahead of player
    despawnDistanceMeters: 20, // Despawn behind player
    spawnIntervalSeconds: 1.5,
    minSpeedKph: 40,
    maxSpeedKph: 100,
  }
};

export interface LaneConfig {
  index: number;
  worldX: number;
}

export const LANES: LaneConfig[] = [];
const startX = -((GAME_CONFIG.world.laneCount - 1) * GAME_CONFIG.world.laneWidth) / 2;
for (let i = 0; i < GAME_CONFIG.world.laneCount; i++) {
  LANES.push({
    index: i,
    worldX: startX + i * GAME_CONFIG.world.laneWidth,
  });
}
