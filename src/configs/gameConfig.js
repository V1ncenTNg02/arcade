import { config as germsConfig } from '../arcade/germs/main'
import { config as tomConfig } from '../arcade/tom/main'
import { config as snowmanConfig } from '../arcade/snowman/main'
import { config as emojiConfig } from '../arcade/emoji/main'

export const gameConfigs = {
  escapeFromGerms: {
    id: 0,
    key: 'germs',
    name: 'Escape from Germs',
    description: 'Navigate through a virtual world while avoiding and escaping from germs. Test your reflexes and strategic thinking in this exciting game.',
    config: germsConfig,
    category: 'arcade',
    url: '/arcade/escape-from-germs',
    logoUrl: '/assets/games/germs/logo.png',
    ready: true
  },
  tommyJumping: {
    id: 1,
    key: 'tom',
    name: 'Tommy Jumping',
    description:
      'Join Tommy in an adventurous jumping game. Help him overcome obstacles and reach new heights. How far can you guide Tommy in this endless jumping journey?',
    config: tomConfig,
    category: 'arcade',
    url: '/arcade/tommy-jumping',
    logoUrl: '/assets/games/tom/logo.png',
    ready: true
  },
  snowmanDefender: {
    id: 2,
    key: 'snowman',
    name: 'Snowman Defender',
    description:
      'Defend your snowman against waves of attackers. Utilize various defenses and power-ups to keep your snowman safe. A thrilling defense game set in a winter wonderland.',
    config: snowmanConfig,
    category: 'arcade',
    url: '/arcade/snowman-defender',
    logoUrl: '/assets/games/snowman/logo.png',
    ready: true
  },
  emojiMatch: {
    id: 3,
    key: 'emoji',
    name: 'Emoji Match',
    description:
      'Exercise your memory and matching skills in the Emoji Match game. Flip cards to find matching emoji pairs within the given time. How quickly can you match them all?',
    config: emojiConfig,
    category: 'arcade',
    url: '/arcade/emoji-match',
    logoUrl: '/assets/games/emoji/logo.png',
    ready: true
  },
  cryptoDungeon: {
    id: 4,
    key: 'dungeon',
    name: 'Crypto Dungeon',
    description:
      'Exercise your memory and matching skills in the Emoji Match game. Flip cards to find matching emoji pairs within the given time. How quickly can you match them all?',
    category: 'indie-game',
    url: '/indie-game/crypto-dungeon',
    logoUrl: '/assets/games/dungeon/logo.png',
    ready: false
  },
  spaceRacers: {
    id: 5,
    key: 'space',
    name: 'Space Racers',
    description:
      'Zoom through the cosmos in a high-speed space race. Dodge asteroids, outmaneuver opponents, and claim victory in Space Racers. Do you have the skills to conquer the galaxy?',
    category: 'indie-game',
    url: '/indie-game/space-racers',
    logoUrl: '/assets/games/space/logo.png',
    ready: false
  },
  treasureHunters: {
    id: 6,
    key: 'treasure',
    name: 'Treasure Hunters',
    description:
      'Embark on a thrilling quest for hidden treasures. Solve puzzles, overcome challenges, and discover the secrets of Treasure Hunters. Can you find the legendary artifacts?',
    category: 'aaa-game',
    url: '/aaa-game/treasure-hunters',
    logoUrl: '/assets/games/treasure/logo.png',
    ready: false
  }
}
