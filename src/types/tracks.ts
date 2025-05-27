export interface Track {
  kunos_id: string;
  name: string;
  image_file?: string; // Optional image filename
  rotation?: number; // Rotation angle in degrees to align telemetry data with track image
}

export const Tracks: Track[] = [
  { kunos_id: "barcelona", name: "Barcelona", image_file: "barcelona-n.svg" },
  { kunos_id: "mount_panorama", name: "Bathurst", image_file: "bathurst.svg" },
  {
    kunos_id: "brands_hatch",
    name: "Brands Hatch",
    image_file: "brands-hatch-n.svg",
  },
  { kunos_id: "cota", name: "Circuit of the Americas", image_file: "cota.svg" },
  {
    kunos_id: "donington",
    name: "Donington Park",
    image_file: "donington.svg",
    rotation: -50,
  },
  {
    kunos_id: "Hungaroring",
    name: "Hungaroring",
    image_file: "hungaroring-n.svg",
    rotation: 0,
  },
  { kunos_id: "Imola", name: "Imola", image_file: "imola.svg" },
  { kunos_id: "indianapolis", name: "Indianapolis", image_file: "indi.svg" },
  { kunos_id: "kyalami", name: "Kyalami", image_file: "kyalami.svg" },
  { kunos_id: "laguna_seca", name: "Laguna Seca", image_file: "laguna.svg" },
  { kunos_id: "misano", name: "Misano", image_file: "misano-n.svg" },
  {
    kunos_id: "monza",
    name: "Monza",
    image_file: "monza-n.svg",
    rotation: -95,
  },
  {
    kunos_id: "nurburgring_24h",
    name: "Nordschleife",
    image_file: "NBR24h-ok.svg",
    rotation: -90,
  },
  {
    kunos_id: "nurburgring",
    name: "Nürburgring GP",
    image_file: "nurburgring-n.svg",
  },
  {
    kunos_id: "oulton_park",
    name: "Oulton Park",
    image_file: "oulton.svg",
    rotation: 0,
  },
  {
    kunos_id: "paul_ricard",
    name: "Paul Ricard",
    image_file: "paul-ricard-n.svg",
  },
  {
    kunos_id: "red_bull_ring",
    name: "Red Bull Ring",
    image_file: "austria-n.svg",
  },
  {
    kunos_id: "Silverstone",
    name: "Silverstone",
    image_file: "silverstone-n.svg",
  },
  { kunos_id: "snetterton", name: "Snetterton", image_file: "snetterton.svg" },
  {
    kunos_id: "Spa",
    name: "Spa Francorchamps",
    image_file: "spa-n.svg",
    rotation: -90,
  },
  { kunos_id: "Suzuka", name: "Suzuka", image_file: "suzuka.svg", rotation: 0 },
  { kunos_id: "valencia", name: "Valencia", image_file: "valencia.svg" },
  { kunos_id: "watkins_glen", name: "Watkins Glen", image_file: "watkins.svg" },
  { kunos_id: "zandvoort", name: "Zandvoort", image_file: "zandvoort.svg" },
  { kunos_id: "zolder", name: "Zolder", image_file: "zolder-n.svg" },
];

export const TrackMap: ReadonlyMap<string, string> = Tracks.reduce(
  (map, track) => {
    map.set(track.kunos_id, track.name);
    return map;
  },
  new Map<string, string>()
);

// Map to get the image filename for a track ID
export const TrackImageMap: ReadonlyMap<string, string> = Tracks.reduce(
  (map, track) => {
    if (track.image_file) {
      map.set(track.kunos_id, track.image_file);
    }
    return map;
  },
  new Map<string, string>()
);

// Map to get the rotation angle for a track ID
export const TrackRotationMap: ReadonlyMap<string, number> = Tracks.reduce(
  (map, track) => {
    if (track.rotation !== undefined) {
      map.set(track.kunos_id, track.rotation);
    }
    return map;
  },
  new Map<string, number>()
);

export const GripMap: ReadonlyMap<number, string> = new Map<number, string>([
  [0, "Green"],
  [1, "Fast"],
  [2, "Optimum"],
  [3, "Greasy"],
  [4, "Damp"],
  [5, "Wet"],
  [6, "Flooded"],
]);
