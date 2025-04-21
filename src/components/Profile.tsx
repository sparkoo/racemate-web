import { FunctionalComponent } from "preact";
import { useAuth } from "../contexts/AuthContext";

interface Props {}

const Profile: FunctionalComponent<Props> = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Please sign in to view your profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-base-200 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-amber-400">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.indexOf('default-avatar.png') === -1) {
                      target.src = "/default-avatar.png";
                    }
                  }}
                />
              ) : (
                <img
                  src="/default-avatar.png"
                  alt="Default Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {currentUser.displayName || "User"}
            </h1>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-base-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="ml-2 text-white">{currentUser.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Account ID:</span>
                    <span className="ml-2 text-white">{currentUser.uid}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Provider:</span>
                    <span className="ml-2 text-white">
                      {currentUser.providerData.length > 0
                        ? currentUser.providerData[0].providerId.replace(".com", "")
                        : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email Verified:</span>
                    <span className="ml-2 text-white">
                      {currentUser.emailVerified ? (
                        <span className="text-green-500">Verified ✓</span>
                      ) : (
                        <span className="text-red-500">Not Verified ✗</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-base-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Account Activity</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="ml-2 text-white">
                      {currentUser.metadata.creationTime
                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Sign In:</span>
                    <span className="ml-2 text-white">
                      {currentUser.metadata.lastSignInTime
                        ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
