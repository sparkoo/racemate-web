import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  limit
} from "firebase/firestore";
import { firebaseApp } from "../main";
import { LapData } from "../types/lapdata";
import { Tracks } from "../types/tracks";
import { CarMap } from "../types/cars";

interface Props {}

const LastRecordedLaps: FunctionalComponent<Props> = () => {
  const db = getFirestore(firebaseApp);
  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchLastLaps = async () => {
      try {
        const lapsCollection = collection(db, "laps");
        
        // Query for the most recent laps, limited to 5
        const q = query(
          lapsCollection,
          orderBy("timestamp", "desc"),
          limit(10)
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedLaps = querySnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              } as LapData)
            );
            setLaps(fetchedLaps);
            setLoading(false);
          },
          (err) => {
            console.error("LastRecordedLaps: Error listening for updates:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        console.error("LastRecordedLaps: Error setting up query:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLastLaps();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Helper function to format lap time
  const formatLaptime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const millis = milliseconds % 1000;

    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");
    const millisStr = millis.toString().padStart(3, "0");

    return `${minutesStr}:${secondsStr}.${millisStr}`;
  };

  // Helper function to get track name from track ID
  const getTrackName = (trackId: string): string => {
    const track = Tracks.find(t => t.kunos_id === trackId);
    return track ? track.name : trackId;
  };

  return (
    <div>
      <h2 className={"card-title text-2xl"}>Your last recorded laps</h2>
      {laps.length === 0 ? (
        <div className="text-center text-gray-500 my-4">No laps recorded yet</div>
      ) : (
        <table className={"table min-w-full table-zebra table-md table-pin-rows"}>
          <thead>
            <tr>
              <th>Track</th>
              <th>Car</th>
              <th>Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => (
              <tr key={lap.id}>
                <td>{getTrackName(lap.track)}</td>
                <td>{CarMap.get(lap.car) || lap.car}</td>
                <td>{formatLaptime(lap.laptime)}</td>
                <td>{new Date(lap.timestamp * 1000).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LastRecordedLaps;
