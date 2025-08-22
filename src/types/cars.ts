export interface Car {
  kunos_id: string;
  name: string;
  class: string; // GT3, GT4, etc.
}

export const Cars: Car[] = [
  // GT3 Cars
  {
    kunos_id: "amr_v8_vantage_gt3",
    name: "Aston Martin V8 Vantage GT3 2019",
    class: "GT3",
  },
  {
    kunos_id: "amr_v12_vantage_gt3",
    name: "Aston Martin Vantage V12 GT3 2013",
    class: "GT3",
  },
  { kunos_id: "audi_r8_lms_evo", name: "Audi R8 LMS Evo 2019", class: "GT3" },
  {
    kunos_id: "bentley_continental_gt3_2018",
    name: "Bentley Continental GT3 2018",
    class: "GT3",
  },
  { kunos_id: "bmw_m4_gt3", name: "BMW M4 GT3 2022", class: "GT3" },
  {
    kunos_id: "ferrari_296_gt3",
    name: "Ferrari 296 GT3 2023",
    class: "GT3",
  },
  {
    kunos_id: "ferrari_488_gt3_evo",
    name: "Ferrari 488 GT3 Evo 2020",
    class: "GT3",
  },
  {
    kunos_id: "lamborghini_huracan_gt3_evo",
    name: "Lamborghini Huracan GT3 Evo 2019",
    class: "GT3",
  },
  { kunos_id: "mclaren_720s_gt3", name: "McLaren 720S GT3 2019", class: "GT3" },
  {
    kunos_id: "mercedes_amg_gt3_evo",
    name: "Mercedes-AMG GT3 Evo 2020",
    class: "GT3",
  },
  {
    kunos_id: "porsche_991ii_gt3_r",
    name: "Porsche 911 II GT3 R 2019",
    class: "GT3",
  },
  { kunos_id: "lexus_rc_f_gt3", name: "Lexus RC F GT3 2016", class: "GT3" },

  // GT4 Cars
  {
    kunos_id: "amr_v8_vantage_gt4",
    name: "Aston Martin Vantage AMR GT4 2018",
    class: "GT4",
  },
  { kunos_id: "alpine_a110_gt4", name: "Alpine A110 GT4 2018", class: "GT4" },
  { kunos_id: "bmw_m4_gt4", name: "BMW M4 GT4 2018", class: "GT4" },
  { kunos_id: "mclaren_570s_gt4", name: "McLaren 570S GT4 2018", class: "GT4" },
  {
    kunos_id: "porsche_718_cayman_gt4_mr",
    name: "Porsche 718 Cayman GT4 MR 2019",
    class: "GT4",
  },

  // Cup Cars
  {
    kunos_id: "porsche_991ii_gt3_cup",
    name: "Porsche 911 II GT3 Cup 2017",
    class: "Cup",
  },
  {
    kunos_id: "ferrari_488_challenge_evo",
    name: "Ferrari 488 Challenge Evo 2020",
    class: "Cup",
  },
  {
    kunos_id: "lamborghini_huracan_st_evo2",
    name: "Lamborghini Huracan ST Evo2 2021",
    class: "Cup",
  },
];

export const CarMap: ReadonlyMap<string, string> = Cars.reduce((map, car) => {
  map.set(car.kunos_id, car.name);
  return map;
}, new Map<string, string>());

// Map to get the class for a car ID
export const CarClassMap: ReadonlyMap<string, string> = Cars.reduce(
  (map, car) => {
    map.set(car.kunos_id, car.class);
    return map;
  },
  new Map<string, string>()
);

// Get unique car classes
export const CarClasses: string[] = Array.from(
  new Set(Cars.map((car) => car.class))
);
