// Warhammer 40,000: one galaxy map, every faction with a home. The Imperium
// holds Sol and the core worlds, Chaos the warp rifts, the Kin the galactic
// core, and the Tyranids come in from the galactic east.
import { MAPS } from './maps/index.js';

export const WARHAMMER_40K = {
  id: 'warhammer-40k',
  name: 'Warhammer 40,000',
  maps: [MAPS['galaxy-40k'], MAPS['armageddon']],
  // Armageddon is drawn twice: as a world on the galaxy map, and as its own
  // surface. Landing there from orbit puts you at Hive Infernus.
  gates: [
    ['armageddon', 'hive-infernus', 'Orbital descent'],
  ],
  overview: { name: 'The whole galaxy' },
  // Simplest mode: the three great sides of the 41st millennium.
  alliances: [
    { id: 'imperium', name: 'The Imperium', color: '#c9a227', home: 'terra-40k' },
    { id: 'chaos-alliance', name: 'Chaos', color: '#8e0000', home: 'eye-of-terror' },
    { id: 'xenos', name: 'Xenos', color: '#00897b', home: 'charadon' },
  ],
  // Every home can never fall. The map is light, so no pale colours.
  factions: [
    // Imperium
    { id: 'custodes', name: 'Adeptus Custodes', color: '#c9a227', home: 'terra-40k', alliance: 'imperium' },
    { id: 'mechanicus', name: 'Adeptus Mechanicus', color: '#bf360c', home: 'mars-40k', alliance: 'imperium',
      subfactions: [
        { id: 'forge-world-mars', name: 'Forge World Mars', home: 'olympus-mons' },
        { id: 'forge-world-graia', name: 'Forge World Graia', home: 'graia', color: '#455a64' },
        { id: 'forge-world-metalica', name: 'Forge World Metalica', home: 'metalica-40k', color: '#546e7a' },
        { id: 'forge-world-lucius', name: 'Forge World Lucius', home: 'lucius-40k', color: '#e64a19' },
        { id: 'forge-world-ryza', name: 'Forge World Ryza', home: 'ryza', color: '#c62828' },
        { id: 'forge-world-stygies-viii', name: 'Forge World Stygies VIII', home: 'stygies-viii', color: '#5d4037' },
      ] },
    { id: 'grey-knights', name: 'Grey Knights', color: '#78909c', home: 'titan', alliance: 'imperium' },
    { id: 'space-marines', name: 'Space Marines', color: '#1565c0', home: 'macragge-40k', alliance: 'imperium',
      subfactions: [
        { id: 'ultramarines', name: 'Ultramarines', home: 'calth' },
        { id: 'imperial-fists', name: 'Imperial Fists', home: 'phalanx', color: '#f9a825' },
        { id: 'salamanders', name: 'Salamanders', home: 'nocturne-40k', color: '#2e7d32' },
        { id: 'raven-guard', name: 'Raven Guard', home: 'deliverance', color: '#1a1a2e' },
        { id: 'white-scars', name: 'White Scars', home: 'chogoris', color: '#c1440e' },
        { id: 'iron-hands', name: 'Iron Hands', home: 'medusa', color: '#37474f' },
        { id: 'crimson-fists', name: 'Crimson Fists', home: 'rynns-world', color: '#7a1f2b' },
        { id: 'carcharodons', name: 'Carcharodons', home: 'formund', color: '#3b4b52' },
        { id: 'flesh-tearers', name: 'Flesh Tearers', home: 'cretacia', color: '#5c0a0a' },
        { id: 'minotaurs', name: 'Minotaurs', home: 'golgotha', color: '#8d6e63' },
      ] },
    { id: 'dark-angels', name: 'Dark Angels', color: '#1b5e20', home: 'the-rock', alliance: 'imperium',
      subfactions: [
        { id: 'deathwing', name: 'Deathwing', home: 'luther-mcintyre', color: '#8d8370' },
        { id: 'ravenwing', name: 'Ravenwing', home: 'dimmamar', color: '#1c1c1c' },
      ] },
    { id: 'space-wolves', name: 'Space Wolves', color: '#5c7a8a', home: 'fenris-40k', alliance: 'imperium',
      subfactions: [
        { id: 'company-of-grimnar', name: 'Great Company of Logan Grimnar', home: 'great-company-grimnar', color: '#3f5a68' },
        { id: 'company-of-blackmane', name: 'Great Company of Ragnar Blackmane', home: 'great-company-blackmane', color: '#4a6b7a' },
        { id: 'company-of-redmaw', name: 'Great Company of Bran Redmaw', home: 'great-company-redmaw', color: '#2c4a52' },
      ] },
    { id: 'blood-angels', name: 'Blood Angels', color: '#e53935', home: 'baal-40k', alliance: 'imperium' },
    { id: 'black-templars', name: 'Black Templars', color: '#212121', home: 'the-eternal-crusader', alliance: 'imperium' },
    { id: 'deathwatch', name: 'Deathwatch', color: '#455a64', home: 'watch-fortress-erioch', alliance: 'imperium' },
    { id: 'astra-militarum', name: 'Astra Militarum', color: '#6d7b3a', home: 'cadia', alliance: 'imperium',
      subfactions: [
        { id: 'cadian', name: 'Cadian', home: 'kasr-kraf' },
        { id: 'catachan-jungle-fighters', name: 'Catachan Jungle Fighters', home: 'catachan', color: '#33691e' },
        { id: 'death-korps-of-krieg', name: 'Death Korps of Krieg', home: 'krieg', color: '#37474f' },
        { id: 'valhallan-ice-warriors', name: 'Valhallan Ice Warriors', home: 'valhalla', color: '#5c6bc0' },
        { id: 'armageddon-steel-legion', name: 'Armageddon Steel Legion', home: 'hive-infernus', color: '#455a64' },
        { id: 'tallarn-desert-raiders', name: 'Tallarn Desert Raiders', home: 'tallarn-40k', color: '#c1440e' },
      ] },
    { id: 'sororitas', name: 'Adepta Sororitas', color: '#ad1457', home: 'ophelia', alliance: 'imperium',
      subfactions: [
        { id: 'our-martyred-lady', name: 'Order of Our Martyred Lady', home: 'sacred-martyrium' },
        { id: 'valorous-heart', name: 'Order of the Valorous Heart', home: 'castellum-valorum', color: '#f57f17' },
        { id: 'bloody-rose', name: 'Order of the Bloody Rose', home: 'rose-fortress', color: '#b71c1c' },
        { id: 'argent-shroud', name: 'Order of the Argent Shroud', home: 'shrouded-reach', color: '#37474f' },
        { id: 'ebon-chalice', name: 'Order of the Ebon Chalice', home: 'ebon-sanctum', color: '#212121' },
      ] },
    { id: 'imperial-knights', name: 'Imperial Knights', color: '#fdd835', home: 'chiros', alliance: 'imperium',
      subfactions: [
        { id: 'house-terryn', name: 'House Terryn', home: 'terryn-prime' },
        { id: 'house-griffith', name: 'House Griffith', home: 'griffiths-landing', color: '#1565c0' },
        { id: 'house-raven', name: 'House Raven', home: 'ravens-roost', color: '#212121' },
        { id: 'house-cadmus', name: 'House Cadmus', home: 'cadmus-primus', color: '#6a1b9a' },
      ] },
    { id: 'imperial-agents', name: 'Imperial Agents', color: '#4e342e', home: 'hydraphur', alliance: 'imperium' },
    // Chaos
    { id: 'chaos-space-marines', name: 'Chaos Space Marines', color: '#b8860b', home: 'storm-of-the-emperors-wrath', alliance: 'chaos-alliance',
      subfactions: [
        { id: 'black-legion', name: 'Black Legion', home: 'nemesis-tessera', color: '#111111' },
        { id: 'red-corsairs', name: 'Red Corsairs', home: 'badab', color: '#6a0dad' },
        { id: 'word-bearers', name: 'Word Bearers', home: 'sicarus', color: '#7a1f1f' },
        { id: 'iron-warriors', name: 'Iron Warriors', home: 'medrengard', color: '#78716c' },
        { id: 'night-lords', name: 'Night Lords', home: 'nostramo', color: '#0d1b2a' },
        { id: 'alpha-legion', name: 'Alpha Legion', home: 'eskrador', color: '#4a5d23' },
        { id: 'creations-of-bile', name: 'Creations of Bile', home: 'vesalius-reach', color: '#6d4c41' },
      ] },
    { id: 'chaos-daemons', name: 'Chaos Daemons', color: '#e040fb', home: 'eye-of-terror', alliance: 'chaos-alliance' },
    { id: 'chaos-knights', name: 'Chaos Knights', color: '#4a148c', home: 'malfactus', alliance: 'chaos-alliance',
      subfactions: [
        { id: 'house-khymere', name: 'House Khymere', home: 'khymere-fane' },
        { id: 'house-lucaris', name: 'House Lucaris', home: 'lucaris-hold', color: '#b71c1c' },
      ] },
    { id: 'death-guard', name: 'Death Guard', color: '#9e9d24', home: 'sirens-storm', alliance: 'chaos-alliance' },
    { id: 'thousand-sons', name: 'Thousand Sons', color: '#0277bd', home: 'prospero-40k', alliance: 'chaos-alliance' },
    { id: 'world-eaters', name: 'World Eaters', color: '#8e0000', home: 'maelstrom', alliance: 'chaos-alliance' },
    { id: 'emperors-children', name: "Emperor's Children", color: '#ec407a', home: 'somnium-stars', alliance: 'chaos-alliance' },
    // Xenos
    { id: 'necrons', name: 'Necrons', color: '#00c853', home: 'mephrit', alliance: 'xenos',
      subfactions: [
        { id: 'sautekh', name: 'Sautekh Dynasty', home: 'necron-sautekh' },
        { id: 'nihilakh', name: 'Nihilakh Dynasty', home: 'necron-nihilakh', color: '#26a69a' },
        { id: 'mephrit-dynasty', name: 'Mephrit Dynasty', home: 'alaric', color: '#d84315' },
        { id: 'novokh', name: 'Novokh Dynasty', home: 'molov', color: '#b71c1c' },
        { id: 'szarekhan', name: 'Szarekhan Dynasty', home: 'ymga-monolith', color: '#fbc02d' },
      ] },
    { id: 'orks', name: 'Orks', color: '#558b2f', home: 'charadon', alliance: 'xenos',
      subfactions: [
        { id: 'goffs', name: 'Goffs', home: 'gorkogrod', color: '#212121' },
        { id: 'evil-sunz', name: 'Evil Sunz', home: 'redscar', color: '#d32f2f' },
        { id: 'bad-moons', name: 'Bad Moons', home: 'glitzgold', color: '#fdd835' },
        { id: 'deathskulls', name: 'Deathskulls', home: 'black-reach', color: '#1e88e5' },
        { id: 'snakebites', name: 'Snakebites', home: 'bonegrinder', color: '#795548' },
        { id: 'blood-axes', name: 'Blood Axes', home: 'krumpton', color: '#33691e' },
        { id: 'freebooterz', name: 'Freebooterz', home: 'scrapdrift', color: '#6a1b9a' },
      ] },
    { id: 'tyranids', name: 'Tyranids', color: '#8e24aa', home: 'leviathan', alliance: 'xenos',
      subfactions: [
        { id: 'hive-fleet-leviathan', name: 'Hive Fleet Leviathan', home: 'scourge-stars' },
        { id: 'behemoth', name: 'Hive Fleet Behemoth', home: 'ophidian-gulf', color: '#4a148c' },
        { id: 'kraken', name: 'Hive Fleet Kraken', home: 'tendrils-end', color: '#7b1fa2' },
        { id: 'gorgon', name: 'Hive Fleet Gorgon', home: 'gorgons-reach', color: '#6a1b9a' },
        { id: 'jormungandr', name: 'Hive Fleet Jormungandr', home: 'hadex-anomaly', color: '#9c27b0' },
      ] },
    { id: 'genestealer-cults', name: 'Genestealer Cults', color: '#5e35b1', home: 'ichar-iv', alliance: 'xenos' },
    { id: 'tau', name: "T'au Empire", color: '#ef6c00', home: 'tau-empire', alliance: 'xenos',
      subfactions: [
        { id: 'sept-tau', name: "T'au Sept", home: 'tau-homeworld' },
        { id: 'sept-viorla', name: "Vior'la Sept", home: 'viorla', color: '#d84315' },
        { id: 'sept-sacea', name: "Sa'cea Sept", home: 'sacea', color: '#37474f' },
        { id: 'sept-borkan', name: "Bork'an Sept", home: 'borkan', color: '#0277bd' },
        { id: 'farsight-enclaves', name: 'Farsight Enclaves', home: 'attila', color: '#f9a825' },
      ] },
    { id: 'aeldari', name: 'Aeldari', color: '#00897b', home: 'craftworld-iyanden', alliance: 'xenos',
      subfactions: [
        { id: 'ulthwe', name: 'Ulthwé', home: 'craftworld-ulthwe', color: '#37474f' },
        { id: 'biel-tan', name: 'Biel-Tan', home: 'craftworld-biel-tan', color: '#2e7d32' },
        { id: 'saim-hann', name: 'Saim-Hann', home: 'craftworld-saim-hann', color: '#c62828' },
        { id: 'iyanden', name: 'Iyanden', home: 'meros', color: '#f9a825' },
        { id: 'alaitoc', name: 'Alaitoc', home: 'craftworld-alaitoc', color: '#1a237e' },
      ] },
    { id: 'drukhari', name: 'Drukhari', color: '#1b5e5e', home: 'commorragh', alliance: 'xenos',
      subfactions: [
        { id: 'black-heart', name: 'Kabal of the Black Heart', home: 'black-heart-enclave', color: '#b71c1c' },
        { id: 'poisoned-tongue', name: 'Kabal of the Poisoned Tongue', home: 'poisoned-tongue-enclave', color: '#558b2f' },
        { id: 'flayed-skull', name: 'Kabal of the Flayed Skull', home: 'flayed-skull-enclave', color: '#757575' },
      ] },
    { id: 'votann', name: 'Leagues of Votann', color: '#795548', home: 'kin-holds', alliance: 'xenos',
      subfactions: [
        { id: 'greater-thurian-league', name: 'Greater Thurian League', home: 'thurian-hold' },
        { id: 'trans-hyperian-alliance', name: 'Trans-Hyperian Alliance', home: 'hyperian-hold', color: '#546e7a' },
        { id: 'ymyr-conglomerate', name: 'Ymyr Conglomerate', home: 'ymyr-hold', color: '#37474f' },
      ] },
  ],
};
