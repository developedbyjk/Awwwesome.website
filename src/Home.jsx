import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Home() {
  const [website, setWebsite] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [user, setUser] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const iconname = (arg) => {
    const myarg = arg
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split(/[/?#]/)[0];
    return `http://www.google.com/s2/favicons?domain=${myarg}`;
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        navigate("/");
      })
      .catch((error) => {
        console.log("Error signing out:", error);
      });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredWebsites(website);
    } else {
      const filtered = website.filter((site) => site.tag === category);
      setFilteredWebsites(filtered);
    }
  };

  async function EditWebsite(website) {
    const websiteName = prompt("Enter the name of the website", website.name);
    const websiteLink = prompt("Enter the link of the website", website.link);
    const websiteDesc = prompt("Enter the description of the website", website.desc);
    const websiteTag = prompt("Enter the Tag", website.tag);

    if (websiteDesc !== null && websiteLink !== null && websiteName !== null && websiteTag !== null) {
      updatePostInDB(website.id, websiteName, websiteLink, websiteDesc, websiteTag);
    } else {
      alert("Update cancelled or incomplete information provided.");
    }
  }

  async function updatePostInDB(docID, websiteName, websiteLink, websiteDesc, websiteTag) {
    try {
      const postRef = doc(db, "website", docID);
      await updateDoc(postRef, {
        name: websiteName,
        link: websiteLink,
        desc: websiteDesc,
        tag: websiteTag,
      });
      alert("Website updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to update document: " + error.message);
    }
  }

  async function DeleteWebsite(website) {
    alert("You are about to delete website with ID: " + website.id);
    try {
      await deleteDoc(doc(db, "website", website.id));
      alert("Website deleted successfully!");
    } catch (error) {
      console.error("Error deleting website: ", error);
      alert("Failed to delete website: " + error.message);
    }
  }

  const renderWebsites = () => {
    return filteredWebsites.map((website) => (
      <div className="container" key={website.id}>
        <div className="tag">{website.tag}</div>
        <a href={website.link} target="_blank" rel="noreferrer">
          <div className="tile">
            <div className="icon">
              <img src={iconname(website.link)} alt={website.name} />
            </div>
            <div>
              <h4>{website.name}</h4>
              <p>{website.desc}</p>
            </div>
          </div>
        </a>
        {user.email && (
          <>
            <button onClick={() => DeleteWebsite(website)} id="delbtn">
              ❌
            </button>
            <button onClick={() => EditWebsite(website)} id="editbtn">
              ✏️
            </button>
          </>
        )}
      </div>
    ));
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        navigate("/");
      } else {
        console.log("User not signed in");
      }
    });
  }, []);

  const addtodatabse = async () => {
    const websiteName = prompt("Enter the name of the website");
    const websiteLink = prompt("Enter the link of the website");
    const websiteDesc = prompt("Enter the description of the website");
    const websiteTag = prompt("Enter the Tag");

    if (websiteName && websiteLink && websiteDesc && websiteTag) {
      try {
        await addDoc(collection(db, "website"), {
          name: websiteName,
          link: "http://" + websiteLink,
          desc: websiteDesc,
          tag: websiteTag,
        });
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "website"), (snapshot) => {
      const websitesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWebsite(websitesList);
      setFilteredWebsites(websitesList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="hero">
        <h1>
          A<span id="www">www</span>esome Website
        </h1>
      </div>
      <div className="category-buttons">
        {["All", "AI", "Design", "Tools"].map((category) => (
          <>
          <div className="buttoncontainer">

          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => handleCategoryChange(category)}
            >
            {category}
          </button>
          {/* <p id="totalnumberofwebsites"> 123</p> */}
              <p id="totalnumberofwebsites">
                {category === "All"
                  ? website.length
                  : website.filter((site) => site.tag === category).length}
              </p>

              </div>
            </>
        ))}
      </div>
      <div className="maincontainer">{renderWebsites()}</div>
      {user.email && (
        <>
          <button id="signoutbtn" onClick={handleSignOut}>
            Sign Out
          </button>
          <button id="addbtn" onClick={addtodatabse}>
            Add
          </button>
        </>
      )}
    </>
  );
}

export default Home;
