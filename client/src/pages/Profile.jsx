import { useUserStats } from "../context/UserStatsContext";

const Profile = () => {
  const { userStats, loading } = useUserStats();

  if (loading)
    return <p className="text-slate-400 text-center mt-10">Loading stats...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-slate-300 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          Welcome back, {userStats.firstName}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md text-center">
            <p className="text-cyan-400 text-sm mb-2">Average Rating</p>
            <p className="text-3xl font-bold">
              {userStats.averageRating || 0} ⭐
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md text-center">
            <p className="text-cyan-400 text-sm mb-2">Interviews Taken</p>
            <p className="text-3xl font-bold">{userStats.interviewsTaken}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md text-center">
            <p className="text-cyan-400 text-sm mb-2">Coins</p>
            <p className="text-3xl font-bold">{userStats.coins}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md text-center">
            <p className="text-cyan-400 text-sm mb-2">Warnings</p>
            <p
              className={`text-3xl font-bold ${
                userStats.warnings > 0 ? "text-yellow-400" : "text-green-400"
              }`}
            >
              {userStats.warnings || 0}/3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
