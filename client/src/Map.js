import logo from "./logo.svg";
import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJhZWRhbmsxODEiLCJhIjoiY2w3Zm55bG54MGM5bTNvczU3cnc3aHZ3dCJ9.PTMOm8axq4w9m_GaYfMp7Q";

//IMPORTS IMAGES AND STORES IN image OBJECT
function importAll(r) {
  let images = {};
  r.keys().map((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
}
const images = importAll(
  require.context("./Images", false, /\.(png|jpe?g|svg)$/)
);

export default function App(userID) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(175.2878457402682);
  const [lat, setLat] = useState(-37.79309033810983);
  const [zoom, setZoom] = useState(14);
  const [sidePanel, setSidePanel] = useState(false);
  const [offense, setOffense] = useState("");
  const [name, setName] = useState("");
  const [mugshot, setMugshot] = useState("");
  const [userData, setUserData] = useState(null);
  const [offenderId, setOffenderId] = useState("");
  const [officerID, setOfficerID] = useState(userID.user);
  const [personWasThere, setPersonWasThere] = useState("");
  const [peopleOnBail, setPeopleOnBail] = useState(null);
  const [colorYes,setColorYes]=useState('white');
  const [colorNo,setColorNo]=useState('white');
  const [yesClicked, setYesClicked] = useState(false)
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [width, setWidth] = useState(window.innerWidth);

  const isMobile = width <= 768;

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  const getPeopleOnBail = () => {

    axios({
      method: "GET",
      withCredentials: true,
      url: "/getPersonsOnBail",
    })
      .then((res) => {
        setPeopleOnBail(res.data);
      })
      .catch((e) => console.error(e));
  };

  const getUser = () => {
    axios({
      method: "GET",
      withCredentials: true,
      url: "/getUser",
    })
      .then((res) => {
        setUserData(res.data.username);
      })
      .catch((e) => console.error(e));
  };

  const logCheck = () => {
    if (officerID && personWasThere) {
      console.log(
        userData + name + officerID + personWasThere + offenderId + Date.now()
      );
      axios({
        method: "POST",
        data: {
          officerid: officerID,
          persononbailid: offenderId,
          checktime: Date.now(),
          personpresent: personWasThere,
        },
        withCredentials: true,
        url: "/logCheck",
      })
        .then((res) => console.log(res))
        .catch((e) => console.error(e));
    }
    console.log("re-login");
  };

  function closeNav() {
    if(isMobile){
      document.getElementById("mySidepanel").style.height = "0";
    }else{
      document.getElementById("mySidepanel").style.width = "0";
    }    
  }

  useEffect(() => {
    getPeopleOnBail();
  }, []);

  useEffect(() => {

    getUser();
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    if (peopleOnBail) {
      peopleOnBail.map((data) => {
        if (data.groupmember == "Treatment") {
          const marker = new mapboxgl.Marker({ color: "red" })
            .setLngLat([data.longitude, data.latitude])
            .addTo(map);
          marker.getElement().addEventListener("click", () => {
            setSidePanel(true); // show side panel
            setName(data.name);
            setOffense(data.offense);
            changeImage(data.photolink);
            setOffenderId(data.user_id);

            setPersonWasThere("")
            setColorYes('white')
            setColorNo('white')
            setSubmitDisabled(true)
            if(isMobile){
              document.getElementById("mySidepanel").style.height = "100vh";
            }else{
              document.getElementById("mySidepanel").style.width = "25vw";
            }            
          });
        } else {
          const marker = new mapboxgl.Marker({ color: "green" })
            .setLngLat([data.longitude, data.latitude])
            .addTo(map);
          marker.getElement().addEventListener("click", () => {
            setSidePanel(true); // show side panel
            setName(data.name);
            setOffense(data.offense);
            changeImage(data.photolink);
            setOffenderId(data.user_id);

            setPersonWasThere("")
            setColorYes('white')
            setColorNo('white')
            setSubmitDisabled(true)
            if(isMobile){
              document.getElementById("mySidepanel").style.height = "100vh";
            }else{
              document.getElementById("mySidepanel").style.width = "25vw";
            } 
          });
        }
      });
    }
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, [peopleOnBail]);

  const changeImage = (src) => {
    setMugshot(src);
  };
  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      {sidePanel ? (
        <div id="mySidepanel" className="sidepanel">
          <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>
            &times;
          </a>
          <a id="title" href="#">
            PERSON ON BAIL
          </a>
          <a href="#">Name: {name}</a>
          <a href="#">Offense: {offense}</a>
          <img id="mugshot" className="rounded" src={images[mugshot]} alt="mugshot" />
          <br />
          <a href="#">Was {name} present?</a>
          <button className="btn m-2 btn-light" style={{background:colorYes}} onClick={() => {
            setPersonWasThere("Yes")
            setColorYes('blue')
            setColorNo('white')
            setSubmitDisabled(false)
            }}>Yes</button>
          <button className="btn m-2 btn-light" style={{background:colorNo}} onClick={() => {
            setPersonWasThere("No")
            setColorNo('blue')
            setColorYes('white')
            setSubmitDisabled(false)
          }}>No</button>
          <br />
          <button disabled={submitDisabled} className="btn m-2 btn-light" onClick={logCheck}>Submit</button>
        </div>
      ) : null}
    </div>
  );
}
