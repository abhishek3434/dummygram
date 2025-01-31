import {
  Avatar,
  Box,
  Button,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { auth, db, storage } from "../lib/firebase";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FaUserCircle } from "react-icons/fa";
import Post from "../components/Post";
import ShareModal from "../components/ShareModal";
import { useSnackbar } from "notistack";

function Profile() {
  const [openShareModal, setOpenShareModal] = useState(false);
  const [currentPostLink, setCurrentPostLink] = useState("");
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const { name, email, avatar } = useLocation().state;
  const isNonMobile = useMediaQuery("(min-width: 768px)");
  const { enqueueSnackbar } = useSnackbar();
  const [image, setImage] = useState("");
  const [profilepic, setProfilePic] = useState(avatar);
  const [visible, setVisibile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const postsRef = db.collection("posts");
      const snapshot = await postsRef.get();
      const posts = [];
      snapshot.forEach((doc) => {
        if (
          localStorage.getItem("posts") &&
          localStorage.getItem("posts").includes(doc.id)
        ) {
          posts.push({ id: doc.id, post: doc.data() });
        }
      });
      setPosts(posts);
    };
    fetchPosts();
  }, []);
  const handleBack = () => {
    navigate("/dummygram"); // Use navigate function to change the URL
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
      setImage(e.target.files[0]);
      setVisibile(true);
    }
  };
  const handleSave = async () => {
    const uploadTask = storage.ref(`images/${image?.name}`).put(image);
    await uploadTask.on(
      "state_changed",
      () => {
        // // progress function ...
        // setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (error) => {
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      },
      () => {
        storage
          .ref("images")
          .child(image?.name)
          .getDownloadURL()
          .then((url) => {
            auth.currentUser.updateProfile({
              displayName: name,
              photoURL: url,
            });
            enqueueSnackbar("Upload Successful!!!", {
              variant: "success",
            });
          });
      }
    );
    setVisibile(false);
  };

  return (
    <>
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width={isNonMobile ? "30%" : "80%"}
          paddingY={3}
          sx={{ border: "1px solid gray", borderRadius: "10px" }}
          display="flex"
          justifyContent="center"
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <Box marginX="auto" fontSize="600%">
              {profilepic ? (
                <Avatar
                  alt={name}
                  src={profilepic}
                  sx={{
                    width: "30vh",
                    height: "30vh",
                    // bgcolor: "royalblue",
                    border: "2px solid transparent",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <FaUserCircle style={{ width: "25vh", height: "25vh" }} />
              )}
            </Box>
            {name == auth.currentUser.displayName ? (
              <Box>
                <input
                  type="file"
                  id="file"
                  className="file"
                  onChange={handleChange}
                  accept="image/*"
                />
                <label htmlFor="file">
                  <div className="img-edit">Edit Profile Pic</div>
                </label>
              </Box>
            ) : (
              ""
            )}
            {visible && (
              <Button
                onClick={handleSave}
                variant="outlined"
                sx={{ marginTop: "1rem" }}
              >
                Save
              </Button>
            )}
            <Divider sx={{ marginTop: "1rem" }} />
            <Typography fontSize="1.3rem" fontWeight="600" fontFamily="serif">
              {name}
            </Typography>
            <Divider />
            <Typography fontSize="1.5rem" fontWeight="600" fontFamily="serif">
              {email && email}
            </Typography>
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{ marginTop: "1rem" }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Box>
      <ShareModal
        openShareModal={openShareModal}
        setOpenShareModal={setOpenShareModal}
        currentPostLink={currentPostLink}
        postText={postText}
      />
      <Box>
        <div
          className="profile__favourites"
          style={{ marginTop: "-5em" }}
          align="center"
        >
          {posts.length ? (
            <>
              <h1>Your Favourites</h1>
              {posts.map(({ id, post }) => (
                <Post
                  key={id}
                  postId={id}
                  user={auth.currentUser}
                  post={post}
                  shareModal={setOpenShareModal}
                  setLink={setCurrentPostLink}
                  setPostText={setPostText}
                />
              ))}
            </>
          ) : (
            <>You have nothing in favourites</>
          )}
        </div>
      </Box>
    </>
  );
}

export default Profile;
