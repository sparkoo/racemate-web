import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";

// Import the functions you need from the SDKs you need
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  where,
} from "firebase/firestore";
import { GripMap } from "../types/tracks";
import { CarMap } from "../types/cars";
import { firebaseApp } from "../main";

interface Props {
  selectedTrack: string;
}

interface LapData {
  id: string;
  fileFireStorage: string;
  name: string;
  track: string;
  laptime: number;
  car: string;
  timestamp: number;
  trackGrip: number;
  weather: string;
  airTemp: number;
  roadTemp: number;
  sessionType: number;
  rainTypes: number;
  lapNumber: string;
}

const LapListing: FunctionalComponent<Props> = ({ selectedTrack }) => {
  const router = useLocation();
  const db = getFirestore(firebaseApp);

  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [selectedLaps, setSelectedLaps] = useState<LapData[]>([]);

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        const productsCollection = collection(db, "laps");
        const wheres: QueryFieldFilterConstraint[] = [];
        if (selectedTrack) {
          wheres.push(where("track", "==", selectedTrack));
        }
        const q = query(
          productsCollection,
          ...wheres,
          orderBy("laptime", "asc")
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedProducts = querySnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as LapData)
            );
            setLaps(fetchedProducts);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            console.error("Error listening for updates:", err);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching products:", err);
      }
    };

    fetchLaps();
  }, [selectedTrack]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const renderRow = (lap: LapData) => {
    return (
      <tr
        key={lap.id}
        class="cursor-pointer hover:bg-amber-950"
        // onClick={() => router.route(`/telemetry?id=${lap.id}`)}
        onClick={() => {
          setSelectedLaps([...selectedLaps, lap]);
        }}
      >
        <td>{new Date(lap.timestamp * 1000).toLocaleString()}</td>
        <td>{lap.name}</td>
        <td>{CarMap.get(lap.car)}</td>
        <td>{formatLaptime(lap.laptime)}</td>
        <td>
          {GripMap.get(lap.trackGrip)} ({lap.rainTypes == 1 ? "W" : "D"})
        </td>
        <td>
          {lap.airTemp.toFixed(1)}&deg;C / {lap.roadTemp.toFixed(1)}&deg;C
        </td>
        <td>{convertSessionType(lap.sessionType)}</td>
      </tr>
    );
  };

  const goAnalyze = () => {
    if (selectedLaps.length > 0) {
      router.route(
        `/telemetry?laps=${selectedLaps.map((lap) => lap.id).join(",")}`
      );
    } else {
      alert("pick some lap");
    }
  };

  return (
    <div className={"h-9/10 overflow-y-auto"}>
      <button className={"btn btn-lg btn-primary"} onClick={goAnalyze}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
          />
        </svg>
        Analyze selected
      </button>
      <table className={"table min-w-full table-zebra table-md table-pin-rows"}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Name</th>
            <th>Car</th>
            <th>LapTime</th>
            <th>Track grip (Tyres)</th>
            <th>Temp (Air/Track)</th>
            <th>Session Type</th>
          </tr>
        </thead>
        <tbody>{selectedLaps.map(renderRow)}</tbody>
      </table>
      <table className={"table min-w-full table-zebra table-md table-pin-rows"}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Name</th>
            <th>Car</th>
            <th>LapTime</th>
            <th>Track grip (Tyres)</th>
            <th>Temp (Air/Track)</th>
            <th>Session Type</th>
          </tr>
        </thead>
        <tbody>{laps.map(renderRow)}</tbody>
      </table>
    </div>
  );
};

function formatLaptime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  const millis = milliseconds % 1000;

  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  const millisStr = millis.toString().padStart(3, "0");

  return `${minutesStr}:${secondsStr}.${millisStr}`;
}

function convertSessionType(type: number): string {
  switch (type) {
    case 0:
      return "Practice";
    case 1:
      return "Qualify";
    case 2:
      return "Race";
    case 3:
      return "HotLap";
    default:
      return "Unknown";
  }
}

export default LapListing;
