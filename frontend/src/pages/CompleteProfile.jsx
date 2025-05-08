import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Import context

const CompleteProfile = () => {
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/user/complete-profile",
        { bio, skills },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ✅ Update user locally
      const updatedUser = { ...user, profileCompleted: true, bio, skills };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser); // Update context

      setMessage("Profile completed! You've earned bonus credits.");

      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Write a short bio..."
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Your skills (comma separated)"
          required
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default CompleteProfile;
