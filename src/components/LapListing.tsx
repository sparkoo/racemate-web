import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

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
import { CarMap, CarClasses, CarClassMap } from "../types/cars";
import { firebaseApp } from "../main";
import { LapData } from "../types/lapdata";

interface Props {
  selectedTrack: string;
  selectedLapCallback: (lap: LapData) => void;
  selectedLaps: LapData[];
}

const LapListing: FunctionalComponent<Props> = ({
  selectedTrack,
  selectedLapCallback,
  selectedLaps,
}) => {
  const db = getFirestore(firebaseApp);

  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [selectedCarClass, setSelectedCarClass] = useState<string>("GT3"); // Default to GT3

  useEffect(() => {
    console.log("LapListing: selectedTrack changed to", selectedTrack);
    if (!selectedTrack) {
      setLaps([]);
      setLoading(false);
      return;
    }

    const fetchLaps = async () => {
      try {
        console.log("LapListing: Fetching laps for track", selectedTrack);
        const lapsCollection = collection(db, "laps");
        const wheres: QueryFieldFilterConstraint[] = [];
        wheres.push(where("track", "==", selectedTrack));
        
        // Filter by car class if one is selected
        if (selectedCarClass) {
          // Get all car IDs that belong to the selected class
          const carIdsInClass = Array.from(CarClassMap.entries())
            .filter(([_, carClass]) => carClass === selectedCarClass)
            .map(([carId, _]) => carId);
          
          if (carIdsInClass.length > 0) {
            wheres.push(where("car", "in", carIdsInClass));
          }
        }

        const q = query(lapsCollection, ...wheres, orderBy("laptime", "asc"));

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(
              "LapListing: Got snapshot with",
              querySnapshot.size,
              "documents"
            );
            const fetchedLaps = querySnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as LapData)
            );
            setLaps(fetchedLaps);
            setLoading(false);
          },
          (err) => {
            console.error("LapListing: Error listening for updates:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        console.error("LapListing: Error setting up query:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLaps();
  }, [selectedTrack, selectedCarClass]); // Re-run when track or car class changes

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
        class={`cursor-pointer ${
          selectedLaps.some((selected) => selected.id === lap.id)
            ? "!bg-amber-950 hover:!bg-amber-900"
            : "hover:!bg-amber-900"
        }`}
        onClick={() => {
          selectedLapCallback(lap);
        }}
      >
        <td>{new Date(lap.timestamp * 1000).toLocaleString()}</td>
        <td>{lap.name}</td>
        <td>{CarMap.get(lap.car)}</td>
        <td>{formatLaptime(lap.laptime)}</td>
        <td className="flex items-center gap-2">
          <span
            title={convertSessionType(lap.sessionType).title}
            className="text-lg"
          >
            {convertSessionType(lap.sessionType).icon}
          </span>
          <span
            title={`${GripMap.get(lap.trackGrip)} Track Grip`}
            className="text-lg"
          >
            {convertGripToIcon(lap.trackGrip)}
          </span>
          <span
            title={lap.rainTypes == 1 ? "Wet Tyres" : "Dry Tyres"}
            className="text-lg"
          >
            {lap.rainTypes == 1 ? "💧" : "☀️"}
          </span>
          <span title="Temperature" className="text-lg">
            🌡️
          </span>
          <span className="opacity-70">
            {lap.airTemp.toFixed(1)}&deg;C / {lap.roadTemp.toFixed(1)}&deg;C
          </span>
        </td>
      </tr>
    );
  };

  console.log("LapListing: Rendering with", laps.length, "laps");
  console.log("LapListing: First lap:", laps[0]);

  // Handle car class change
  const handleCarClassChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setSelectedCarClass(target.value);
  };

  return (
    <div className={"h-full overflow-auto border border-base-300 rounded-lg"}>
      {/* Car Class Filter */}
      <div className="p-3 bg-base-200 border-b border-base-300">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Car Class</span>
          </label>
          <select 
            className="select select-bordered w-full" 
            value={selectedCarClass}
            onChange={handleCarClassChange}
          >
            <option value="">All Classes</option>
            {CarClasses.map(carClass => (
              <option key={carClass} value={carClass}>
                {carClass}
              </option>
            ))}
          </select>
        </div>
      </div>

      {laps.length === 0 ? (
        <div className={"flex h-full items-center justify-center text-lg text-gray-500"}>
          No data available for the selected filters
        </div>
      ) : (
        <table className={"table table-zebra table-md table-pin-rows w-full"}>
          <thead className={"bg-base-100 sticky top-0 z-10"}>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Car</th>
              <th>LapTime</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>{laps.map(renderRow)}</tbody>
        </table>
      )}
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

function convertSessionType(type: number): { icon: string; title: string } {
  switch (type) {
    case 0:
      return { icon: "🏎️", title: "Practice" };
    case 1:
      return { icon: "⏱️", title: "Qualify" };
    case 2:
      return { icon: "🏁", title: "Race" };
    case 3:
      return { icon: "🔥", title: "HotLap" };
    default:
      return { icon: "❓", title: "Unknown" };
  }
}

function convertGripToIcon(gripLevel: number): string {
  switch (gripLevel) {
    case 0:
      return "🟢"; // Green (green circle) - starting point
    case 1:
      return ">"; // Fast (greater than symbol) - better than green
    case 2:
      return "⋙"; // Optimum (triple greater than) - best grip
    case 3:
      return "🔵"; // Greasy (blue circle) - starting to lose grip
    case 4:
      return "💧"; // Damp (droplet) - getting wet
    case 5:
      return "💦"; // Wet (splashing sweat) - very wet
    case 6:
      return "🌊"; // Flooded (wave) - extremely wet
    default:
      return "❓";
  }
}

export default LapListing;
