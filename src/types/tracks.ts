export interface Track {
  kunos_id: string;
  name: string;
}

export const Tracks: Track[] = [
  { kunos_id: "nurburgring_24h", name: "24H Nürburgring (Nordschleife)" },
  { kunos_id: "oulton_park", name: "Oulton Park" },
  { kunos_id: "Suzuka", name: "Suzuka Circuit" },
  { kunos_id: "Hungaroring", name: "Hungaroring" },
  { kunos_id: "monza", name: "Monza" },
  { kunos_id: "Spa", name: "Spa Francorchamps" },
  { kunos_id: "donington", name: "Donington Park" },
];

export const TrackMap: ReadonlyMap<string, string> = Tracks.reduce(
  (map, track) => {
    map.set(track.kunos_id, track.name);
    return map;
  },
  new Map<string, string>()
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
