import { useEffect, useState } from "react";
import { FaPlay, FaPause, FaPlus, FaTrash, FaPlusCircle } from "react-icons/fa";
import { MdMood } from "react-icons/md";
import "./Profile.css";

function Profile({ user, setUser }) {
  const [currentMood, setCurrentMood] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [playingSongUrl, setPlayingSongUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user.username) return;

      try {
        const response = await fetch(
          `https://tunesphere-backend-1.onrender.com/playlist/${user.username}`
        );

        if (!response.ok) {
          console.error("Failed to fetch playlists");
          throw new Error("Failed to fetch playlists");
        }

        const data = await response.json();
        setPlaylists(data.playlists || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, [user.username]);

  const handleSongClick = (songUrl) => {
    setPlayingSongUrl(songUrl); // Set the selected song URL
    setIsPlaying(false); // Reset playing state when a new song is clicked
  };

  const moods = [
    { id: "Happy", name: "Happy", color: "mood-happy" },
    { id: "Sad", name: "Sad", color: "mood-sad" },
    { id: "Energetic", name: "Energetic", color: "mood-energetic" },
    { id: "Relaxed", name: "Relaxed", color: "mood-relaxed" },
    { id: "Romantic", name: "Romantic", color: "mood-romantic" },
  ];

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }

    try {
      const response = await fetch("https://tunesphere-backend-1.onrender.com/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully!");
        setIsEditingPassword(false);
        setNewPassword("");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) {
      alert("Please enter a playlist name.");
      return;
    }

    const username = user.username;

    try {
      const response = await fetch("https://tunesphere-backend-1.onrender.com/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, playlistName: newPlaylistName }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Playlist created successfully!");
        setPlaylists([
          ...playlists,
          { id: data.id, name: newPlaylistName, songs: [] },
        ]);
        setIsCreatingPlaylist(false);
        setNewPlaylistName("");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist. Please try again.");
    }
  };

  const handleAddSong = async (playlistname) => {
    if (!newSongTitle || !newSongUrl) {
      alert("Please enter both the song title and URL.");
      return;
    }

    const username = user.username;

    try {
      const response = await fetch(
        `https://tunesphere-backend-1.onrender.com/playlist/${username}/${playlistname}/songs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newSongTitle, url: newSongUrl }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Song added successfully!");
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.name === playlistname
              ? {
                  ...playlist,
                  songs: [
                    ...playlist.songs,
                    { id: data.id, title: newSongTitle, url: newSongUrl },
                  ],
                }
              : playlist
          )
        );
        setNewSongTitle("");
        setNewSongUrl("");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding song:", error);
      alert("Failed to add song. Please try again.");
    }
  };

  const handleDeleteSong = async (playlistName, songTitle) => {
    if (!playlistName || !songTitle) {
      console.error("Playlist name or song title is missing.");
      alert("Failed to delete song. Please try again.");
      return;
    }
    try {
      const response = await fetch(
        `https://tunesphere-backend-1.onrender.com/playlist/${user.username}/${playlistName}/songs/${songTitle}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Song deleted successfully!");
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.name === playlistName
              ? {
                  ...playlist,
                  songs: playlist.songs.filter((song) => song.title !== songTitle),
                }
              : playlist
          )
        );
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("An error occurred while deleting the song.");
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="profile-container">
      <div className="user-details">
        <h2>Welcome, {user.username}</h2>
        <p>Email: {user.email}</p>
        <button
          className="update-password-button"
          onClick={() => setIsEditingPassword(!isEditingPassword)}
        >
          {isEditingPassword ? "Cancel" : "Update Password"}
        </button>
        {isEditingPassword && (
          <div className="password-update-form">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="save-password-button"
              onClick={handlePasswordUpdate}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="mood-section">
        <h2>Your Mindset Today</h2>
        <div className="mood-buttons">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-button ${mood.color} ${
                currentMood === mood.id ? "active-mood" : ""
              }`}
              onClick={() => setCurrentMood(mood.id)}
            >
              <MdMood className="mood-icon" />
              <span>{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="playlist-section">
        <div className="playlist-header">
          <h2>Your Playlists</h2>
          <button onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}>
            <FaPlus /> Create Playlist
          </button>
        </div>

        {isCreatingPlaylist && (
          <div className="create-playlist-form">
            <input
              type="text"
              placeholder="Enter Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <button onClick={handleCreatePlaylist}>Create</button>
            <button onClick={() => setIsCreatingPlaylist(false)}>Cancel</button>
          </div>
        )}

        <div className="playlists">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-card">
              <h3>{playlist.name}</h3>
              <p>{playlist.songs.length} songs</p>
              <button onClick={() => setSelectedPlaylist(playlist)}>View</button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlaylist && (
        <div className="playlist-modal">
          <div className="song-container">
            {selectedPlaylist.songs.map((song) => (
              <div key={song.id} className="song-card">
                <h6>{song.title}</h6>
                <a href={song.url} target="_blank" rel="noopener noreferrer" className="song-url">
                  {song.url}
                </a>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteSong(selectedPlaylist.name, song.title)}
                >
                  Delete
                </button>
                <div className="play-pause-container">
                  <audio
                    src={song.url}
                    controls
                    autoPlay={playingSongUrl === song.url && isPlaying}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="add-song-section">
            <input
              type="text"
              placeholder="Enter Song Name"
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Song URL"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
            />
            <button onClick={() => handleAddSong(selectedPlaylist.name)}>
              <FaPlusCircle /> Add Song
            </button>
          </div>
          <button onClick={() => setSelectedPlaylist(null)}>Close</button>
        </div>
      )}

      {currentMood && (
        <div className="recommendations-section">
          <h2>Recommended for your {currentMood} Mindset</h2>
        </div>
      )}
    </div>
  );
}

export default Profile;
