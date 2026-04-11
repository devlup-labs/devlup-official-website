import { useNavigate, useLocation } from "react-router-dom";

function Forbidden() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-4">403</h1>
      <p className="text-xl mb-6">Permission Denied</p>

      <button
        onClick={() =>
          navigate("/login", { state: { from: location.state?.from } })
        }
        className="bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500"
      >
        Go to Login
      </button>
    </div>
  );
}

export default Forbidden;