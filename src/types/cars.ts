export interface Car {
  kunos_id: string;
  name: string;
}

export const Cars: Car[] = [
  { kunos_id: "amr_v8_vantage_gt3", name: "Aston Martin V8 Vantage GT3 2019" },
  { kunos_id: "amr_v12_vantage_gt3", name: "Aston Martin Vantage V12 GT3 2013" },
];

export const CarMap: ReadonlyMap<string, string> = Cars.reduce(
  (map, car) => {
    map.set(car.kunos_id, car.name);
    return map;
  },
  new Map<string, string>()
);