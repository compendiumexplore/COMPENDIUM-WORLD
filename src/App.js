import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Splash from "./Splash";
import CoverFlow from "./CoverFlowSite";
import TopBar from "./TopBar";
import Footer from "./Footer";
import GlobeView from "./GlobeView";
import Globe from "react-globe.gl";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-jS09C_yxfQeCRBzAjA8vQoZTV3ywfnwl3QcGoXTw4lSfqLvLCCdg-y1l7ihWIkaLCFJu7odlWyYx/pub?output=csv";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId;
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150); 
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  return windowSize;
}

// --- FIXED: WRAPPED IN REACT.MEMO TO PREVENT RE-RENDERS ---
const FloatingMapTile = React.memo(function FloatingMapTile({ data, onClick, isMobile }) {
  const globeRef = useRef();
  const [markers, setMarkers] = useState([]);
  const offsetRef = useRef(0);
  const satellitesRef = useRef([]);
  const physicalMarkersRef = useRef([]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 2.2 });
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controls.enableZoom = false;
        controls.enablePan = false;
      }
    }
  }, []);

  useEffect(() => {
    const physical = [];
    const satellites = [];
    let index = 0;

    if (data) {
      Object.values(data).forEach((subcategories) => {
        Object.values(subcategories).forEach((items) => {
          items.forEach((item) => {
            if (item.lat) {
              const cleanLat = String(item.lat).trim().toUpperCase();
              if (cleanLat === "WEB") {
                const nodeLng = (index * 73) % 360 - 180;
                satellites.push({
                  id: `web-${index}`, 
                  isWeb: true, nodeLng, inclination: ((index * 53 + 25) % 140) - 70, 
                  direction: index % 2 === 0 ? 1 : -1, speedMult: 0.7 + (index % 4) * 0.2, 
                  initialPhase: (index * 137.5) % 360, lat: 0, lng: nodeLng,
                  altitude: 0.18 + (index % 3) * 0.08,
                });
              } else if (!isNaN(parseFloat(item.lat)) && !isNaN(parseFloat(item.lng))) {
                physical.push({
                  id: `geo-${index}`, 
                  isWeb: false, lat: parseFloat(item.lat),
                  lng: parseFloat(item.lng), altitude: 0.005,
                });
              }
            }
            index++;
          });
        });
      });
    }
    physicalMarkersRef.current = physical;
    satellitesRef.current = satellites;
    setMarkers([...physical, ...satellites]);
  }, [data]);

  useEffect(() => {
    let animFrame;
    const animate = () => {
      offsetRef.current = (offsetRef.current + 0.024) % 360;
      const offset = offsetRef.current;
      satellitesRef.current.forEach((sat) => {
        const totalAngleDeg = sat.initialPhase + offset * sat.direction * sat.speedMult;
        const theta = (totalAngleDeg * Math.PI) / 180;
        const incRad = (sat.inclination * Math.PI) / 180;
        const latRad = Math.asin(Math.sin(incRad) * Math.sin(theta));
        const lngRad = Math.atan2(Math.cos(incRad) * Math.sin(theta), Math.cos(theta));
        sat.lat = (latRad * 180) / Math.PI;
        let calculatedLng = sat.nodeLng + (lngRad * 180) / Math.PI;
        sat.lng = (((calculatedLng + 180) % 360) + 360) % 360 - 180;
      });
      setMarkers([...physicalMarkersRef.current, ...satellitesRef.current]);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick("map")}
      style={{
        position: "fixed",
        bottom: isMobile ? "24px" : "40px",
        right: isMobile ? "24px" : "40px",
        width: isMobile ? "120px" : "150px",
        height: isMobile ? "70px" : "86px",
        backgroundColor: "rgba(255, 255, 255, 0.5)", 
        backdropFilter: "blur(24px) saturate(120%)", 
        WebkitBackdropFilter: "blur(24px) saturate(120%)",
        border: "1px solid rgba(255, 255, 255, 0.7)", 
        borderRadius: "12px",
        boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
        overflow: "hidden", 
        zIndex: 5000, 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ pointerEvents: "none", position: "absolute", top: "-15px" }}>
        <Globe
          ref={globeRef}
          width={180} 
          height={180}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          htmlElementsData={markers}
          htmlTransitionDuration={0} 
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="altitude"
          htmlElement={(d) => {
            const wrapper = document.createElement("div");
            wrapper.style.transform = "translate(-50%, -50%)";
            const square = document.createElement("div");
            square.style.width = "4px"; 
            square.style.height = "4px";
            square.style.backgroundColor = d.isWeb ? "#0014FF" : "#FF007A"; 
            square.style.filter = "blur(1px)"; 
            square.style.borderRadius = "1px";
            wrapper.appendChild(square);
            return wrapper;
          }}
        />
      </div>
    </motion.div>
  );
});

export default function App() {
  const [level, setLevel] = useState(0);
  const [data, setData] = useState({});
  const [selection, setSelection] = useState({ cat: null, sub: null });
  const [activeCover, setActiveCover] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pills, setPills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [globalItems, setGlobalItems] = useState([]);
  const [globalTitle, setGlobalTitle] = useState("");
  const [currentBgImage, setCurrentBgImage] = useState(null);
  
  // --- SMART BACK BUTTON MEMORY ---
  const [returnToGlobe, setReturnToGlobe] = useState(false);

  const requestRef = useRef();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const flattenedData = useMemo(() => {
    let all = [];
    Object.values(data).forEach((subcategories) => {
      Object.values(subcategories).forEach((items) => {
        all.push(...items);
      });
    });
    return all;
  }, [data]);

  const allImages = useMemo(() => {
    return flattenedData.map((item) => item.image).filter(Boolean);
  }, [flattenedData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(SHEET_URL + "&nocache=" + Math.random());
        const text = await response.text();
        const rows = text.split(/\r?\n/).filter((row) => row.trim() !== "");
        const dataRows = rows.slice(1);
        const structuredData = {};

        dataRows.forEach((row) => {
          const cols = row.split(",").map((s) => s?.trim());
          const cat = cols[1];
          const sub = cols[2];
          const name = cols[3];
          const city = cols[4];
          const country = cols[5];
          const web = cols[6];
          const nav = cols[8];

          const lat = cols[12]?.trim() || null;
          const lng = cols[13]?.trim() || null;

          let rawImg = cols[10];
          let finalImg = rawImg;

          if (rawImg && rawImg.includes("drive.google.com")) {
            const idMatch = rawImg.match(/id=([^&]+)/);
            if (idMatch && idMatch[1]) {
              finalImg = `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`;
            }
          }

          const img = finalImg;
          const isGift = cols.some(
            (val, index) =>
              index >= 9 &&
              val &&
              val.replace(/["']/g, "").trim().toUpperCase() === "X"
          );

          if (!cat || !name) return;
          if (!structuredData[cat]) structuredData[cat] = {};
          if (!structuredData[cat][sub]) structuredData[cat][sub] = [];

          const displayLoc =
            city && country ? `${city} – ${country}` : city || country || "WEB";
          structuredData[cat][sub].push({
            name,
            location: displayLoc.toUpperCase(),
            website: web || "#",
            directions: nav || "#",
            image:
              img ||
              "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000",
            category: cat,
            subcategory: sub,
            isGiftGuide: isGift,
            lat,
            lng,
          });
        });

        Object.keys(structuredData).forEach((c) => {
          Object.keys(structuredData[c]).forEach((s) => {
            structuredData[c][s].sort((a, b) => a.name.localeCompare(b.name));
          });
        });

        setData(structuredData);
        const categories = Object.keys(structuredData);
        const generatedPills = [];

        categories.forEach((name) => {
          const w = isMobile ? name.length * 2.2 + 12 : name.length * 0.5 + 8;
          const h = isMobile ? 8 : 6;

          let x = 0;
          let y = 0;
          let overlaps = false;
          let attempts = 0;

          do {
            overlaps = false;
            x = Math.random() * (isMobile ? 50 : 70) + 8;
            y = Math.random() * 55 + 16;

            for (let existingPill of generatedPills) {
              if (
                x < existingPill.x + existingPill.w &&
                x + w > existingPill.x &&
                y < existingPill.y + existingPill.h &&
                y + h > existingPill.y
              ) {
                overlaps = true;
                break;
              }
            }
            attempts++;
          } while (overlaps && attempts < 150);

          generatedPills.push({
            name,
            x,
            y,
            vx: (Math.random() - 0.5) * (isMobile ? 0.004 : 0.006),
            vy: (Math.random() - 0.5) * (isMobile ? 0.004 : 0.006),
            w,
            h: isMobile ? 11 : 6,
          });
        });

        setPills(generatedPills);

        let flatData = [];
        Object.values(structuredData).forEach((subcats) => {
          Object.values(subcats).forEach((items) => {
            flatData.push(...items);
          });
        });

        if (flatData.length > 0) {
          setCurrentBgImage(
            flatData[Math.floor(Math.random() * flatData.length)].image
          );
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (level === 1 && !loading && flattenedData.length > 0) {
      setCurrentBgImage(
        flattenedData[Math.floor(Math.random() * flattenedData.length)].image
      );
    }
  }, [level, loading, flattenedData]);

  const handleOverviewClick = useCallback((viewType) => {
    const all = [...flattenedData].sort((a, b) => a.name.localeCompare(b.name));
    setGlobalItems(all);
    setGlobalTitle(viewType === "map" ? "MAP" : "EVERYTHING");
    setLevel(viewType === "map" ? 5 : 4);
    setActiveCover(0);
    setIsMenuOpen(false);
  }, [flattenedData]);

  const handlePopularClick = useCallback(() => {
    const all = [...flattenedData];
    const popular = all.sort(() => 0.5 - Math.random()).slice(0, 15);
    setGlobalItems(popular);
    setGlobalTitle("MOST POPULAR");
    setLevel(4);
    setActiveCover(0);
    setIsMenuOpen(false);
  }, [flattenedData]);

  const handleGiftGuideClick = useCallback(() => {
    let giftGuideItems = flattenedData.filter((item) => item.isGiftGuide);

    if (giftGuideItems.length === 1) {
      giftGuideItems = [
        giftGuideItems[0],
        giftGuideItems[0],
        giftGuideItems[0],
      ];
    } else if (giftGuideItems.length === 2) {
      giftGuideItems = [
        giftGuideItems[0],
        giftGuideItems[1],
        giftGuideItems[0],
        giftGuideItems[1],
      ];
    }

    setGlobalItems(giftGuideItems);
    setGlobalTitle("GIFT GUIDE");
    setLevel(4);
    setActiveCover(0);
    setIsMenuOpen(false);
  }, [flattenedData]);

  const reset = useCallback(() => {
    setLevel(1);
    setSelection({ cat: null, sub: null });
    setGlobalTitle("");
    setZoom(1);
    setIsMenuOpen(false);
    setIsAboutOpen(false);
  }, []);

  const handleRandomClick = useCallback(() => {
    const categories = Object.keys(data);
    if (categories.length === 0) return;
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const subcategories = Object.keys(data[randomCat] || {});
    if (subcategories.length === 0) return;
    const randomSub =
      subcategories[Math.floor(Math.random() * subcategories.length)];

    const items = data[randomCat][randomSub];
    const randomIndex = Math.floor(Math.random() * items.length);

    setSelection({ cat: randomCat, sub: randomSub });
    setReturnToGlobe(false); // Reset memory
    setLevel(3);
    setActiveCover(randomIndex);
    setIsMenuOpen(false);
  }, [data]);

  const handleSubcategorySelect = useCallback((cat, sub) => {
    setSelection({ cat, sub });
    setReturnToGlobe(false); // Reset memory
    setLevel(3);
    setActiveCover(0);
    setIsMenuOpen(false);
  }, []);

  const handleMarkerClick = useCallback((item) => {
    setSelection({ cat: item.category, sub: item.subcategory });
    const itemsInSub = data[item.category]?.[item.subcategory] || [];
    const index = itemsInSub.findIndex((i) => i.name === item.name);
    setActiveCover(index !== -1 ? index : 0);
    setReturnToGlobe(true); // Tag that we came from the map
    setLevel(3);
    setGlobalTitle("");
  }, [data]);

  const handleCategorySelect = useCallback((cat) => {
    setSelection({ cat, sub: null });
    setLevel(2); 
    setIsMenuOpen(false);
  }, []);

  // --- SMART BACK BUTTON LOGIC ---
  const handleBack = useCallback(() => {
    if (level === 5 || level === 4) {
      setGlobalTitle("");
      setLevel(1);
    } else if (level === 3) {
      if (returnToGlobe) {
        setReturnToGlobe(false); // Clear the memory
        setGlobalTitle("MAP");
        setLevel(5); // Return directly to Globe
      } else {
        setLevel(2); // Normal return to Mind Map
      }
    } else if (level === 2) {
      setSelection({ cat: null, sub: null });
      setLevel(1);
    } else if (level === 1) {
      setLevel(0);
    }
  }, [level, returnToGlobe]);

  useEffect(() => {
    const animate = () => {
      if (level === 1) {
        setPills((currentPills) => {
          let updatedPills = currentPills.map((pill) => {
            const speedMultiplier = isMobile ? 0.4 : 1;
            let n = {
              ...pill,
              x: pill.x + pill.vx * speedMultiplier,
              y: pill.y + pill.vy * speedMultiplier,
            };

            const maxX = isMobile ? 100 - pill.w : 98 - pill.w;
            if (n.x <= 2) {
              n.x = 2;
              n.vx = Math.abs(n.vx);
            } else if (n.x >= maxX) {
              n.x = Math.max(2, maxX);
              n.vx = -Math.abs(n.vx);
            }

            if (n.y <= 15) {
              n.y = 15;
              n.vy = Math.abs(n.vy);
            } else if (n.y + pill.h >= 85) {
              n.y = 85 - pill.h;
              n.vy = -Math.abs(n.vy);
            }

            return n;
          });

          for (let i = 0; i < updatedPills.length; i++) {
            for (let j = i + 1; j < updatedPills.length; j++) {
              let p1 = updatedPills[i];
              let p2 = updatedPills[j];

              const deltaX = p1.x + p1.w / 2 - (p2.x + p2.w / 2);
              const deltaY = p1.y + p1.h / 2 - (p2.y + p2.h / 2);
              const overlapX = p1.w / 2 + p2.w / 2 - Math.abs(deltaX);
              const overlapY = p1.h / 2 + p2.h / 2 - Math.abs(deltaY);

              if (overlapX > 0 && overlapY > 0) {
                if (overlapX < overlapY) {
                  const shift = overlapX / 2;
                  if (deltaX > 0) {
                    p1.x += shift;
                    p2.x -= shift;
                  } else {
                    p1.x -= shift;
                    p2.x += shift;
                  }

                  p1.vx = Math.abs(p1.vx) * (deltaX > 0 ? 1 : -1);
                  p2.vx = Math.abs(p2.vx) * (deltaX > 0 ? -1 : 1);
                } else {
                  const shift = overlapY / 2;
                  if (deltaY > 0) {
                    p1.y += shift;
                    p2.y -= shift;
                  } else {
                    p1.y -= shift;
                    p2.y += shift;
                  }

                  p1.vy = Math.abs(p1.vy) * (deltaY > 0 ? 1 : -1);
                  p2.vy = Math.abs(p2.vy) * (deltaY > 0 ? -1 : 1);
                }
              }
            }
          }
          return updatedPills;
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [level, isMobile]);

  const uiEdge = isMobile ? "20px" : "40px";

  if (loading) return null;

  return (
    <div
      style={{
        fontFamily: '"Geist", sans-serif',
        color: "#000",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        {level === 0 && (
          <Splash onEnter={() => setLevel(1)} data={data} isMobile={isMobile} />
        )}

        {level >= 1 && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              width: "100vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {level < 3 && currentBgImage && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 0,
                  overflow: "hidden",
                }}
              >
                <motion.img
                  key={currentBgImage}
                  src={currentBgImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  style={{
                    width: "110%",
                    height: "110%",
                    objectFit: "cover",
                    position: "absolute",
                    top: "-5%",
                    left: "-5%",
                    filter: "blur(40px) brightness(0.9)",
                    transform: "scale(1.1)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </div>
            )}
            {level >= 3 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#F2F2F2",
                  zIndex: 0,
                }}
              />
            )}

            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
              }}
            >
              <TopBar
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                isAboutOpen={isAboutOpen}
                setIsAboutOpen={setIsAboutOpen}
                reset={reset}
                onRandomClick={handleRandomClick}
                onOverviewClick={handleOverviewClick}
                onPopularClick={handlePopularClick}
                onGiftGuideClick={handleGiftGuideClick}
                totalCount={flattenedData.length}
                allImages={allImages}
                isMobile={isMobile}
                data={data}
                onSubcategorySelect={handleSubcategorySelect}
                onCategorySelect={handleCategorySelect} 
              />
              <Footer isMobile={isMobile} />
              {level >= 2 && (
                <div
                  style={{
                    position: "fixed",
                    top: isMobile ? "100px" : "120px",
                    left: uiEdge,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "11px",
                    fontWeight: "800",
                    zIndex: 9998,
                    textTransform: "uppercase",
                    color: "#000",
                  }}
                >
                  <span
                    onClick={reset}
                    style={{ cursor: "pointer", opacity: 0.5 }}
                  >
                    OVERVIEW
                  </span>
                  <span style={{ opacity: 0.3 }}>/</span>
                  {level === 4 || level === 5 ? (
                    <span style={{ color: "#000" }}>{globalTitle}</span>
                  ) : (
                    <>
                      <span
                        onClick={() => setLevel(2)}
                        style={{
                          cursor: level === 3 ? "pointer" : "default",
                          opacity: level === 3 ? 0.5 : 1,
                        }}
                      >
                        {selection.cat}
                      </span>
                      {level === 3 && (
                        <>
                          <span style={{ opacity: 0.3 }}>/</span>
                          <span style={{ color: "#000" }}>{selection.sub}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {level === 3 || level === 4 || level === 5 ? (
                level === 5 ? (
                  <GlobeView items={globalItems} isMobile={isMobile} onMarkerClick={handleMarkerClick} />
                ) : level === 4 && globalItems.length === 0 ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "800",
                      color: "#999",
                      letterSpacing: "0.05em",
                    }}
                  >
                    NO ITEMS FOUND IN GIFT GUIDE
                  </div>
                ) : (
                  <CoverFlow
                    items={
                      level === 4
                        ? globalItems
                        : data[selection.cat][selection.sub]
                    }
                    category={level === 4 ? "THE" : selection.cat}
                    subcategory={level === 4 ? "COMPENDIUM" : selection.sub}
                    activeIndex={activeCover}
                    onSwipe={(dir) =>
                      setActiveCover((prev) =>
                        Math.max(
                          0,
                          Math.min(
                            (level === 4
                              ? globalItems
                              : data[selection.cat][selection.sub]
                            ).length - 1,
                            prev + dir
                          )
                        )
                      )
                    }
                    isMobile={isMobile}
                    width={width}
                  />
                )
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                >
                  {level === 1 &&
                    pills.map((p) => (
                      <motion.div
                        key={p.name}
                        layoutId={`pill-${p.name}`}
                        whileHover={{ scale: isMobile ? 1 : 1.05 }}
                        onClick={() => {
                          setSelection({ ...selection, cat: p.name });
                          setLevel(2);
                        }}
                        style={{
                          position: "absolute",
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          padding: isMobile ? "10px 20px" : "12px 32px",
                          borderRadius: "50px",
                          backgroundColor: "rgba(255, 255, 255, 0.4)",
                          backdropFilter: "blur(20px) saturate(150%)",
                          WebkitBackdropFilter: "blur(20px) saturate(150%)",
                          border: "1px solid rgba(255, 255, 255, 0.5)",
                          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
                          fontSize: isMobile ? "11px" : "12px",
                          fontWeight: "700",
                          letterSpacing: isMobile ? "0.1em" : "0.15em",
                          cursor: "pointer",
                          zIndex: 10,
                          color: "#000",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name.toUpperCase()}
                      </motion.div>
                    ))}

                  {level === 2 && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {Object.keys(data[selection.cat] || {}).map(
                        (sub, i, arr) => {
                          const total = arr.length;
                          const angleOffset =
                            isMobile && total === 4 ? -45 : -90;
                          const angle = (i / total) * 360 + angleOffset;

                          const radiusX = isMobile ? 140 : 260;
                          const radiusY = isMobile ? 170 : 260;

                          const baseX =
                            Math.cos((angle * Math.PI) / 180) * radiusX;
                          const baseY =
                            Math.sin((angle * Math.PI) / 180) * radiusY;

                          const offsetY = isMobile ? 20 : 30;

                          return (
                            <React.Fragment key={sub}>
                              <svg
                                style={{
                                  position: "absolute",
                                  width: "100%",
                                  height: "100%",
                                  zIndex: 5,
                                  pointerEvents: "none",
                                }}
                              >
                                <motion.line
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{
                                    duration: 0.8,
                                    delay: 0.2 + i * 0.05,
                                  }}
                                  x1="50%"
                                  y1={`calc(50% + ${offsetY}px)`}
                                  x2={`calc(50% + ${baseX}px)`}
                                  y2={`calc(50% + ${baseY + offsetY}px)`}
                                  stroke="rgba(0,0,0,0.3)"
                                  strokeWidth="1"
                                />
                              </svg>

                              <motion.div
                                initial={{
                                  opacity: 0,
                                  scale: 0.8,
                                  x: baseX,
                                  y: baseY + offsetY,
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  x: baseX,
                                  y: [
                                    baseY + offsetY,
                                    baseY + offsetY - 6,
                                    baseY + offsetY,
                                  ],
                                }}
                                transition={{
                                  scale: {
                                    duration: 0.4,
                                    delay: 0.2 + i * 0.05,
                                  },
                                  opacity: {
                                    duration: 0.4,
                                    delay: 0.2 + i * 0.05,
                                  },
                                  y: {
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  },
                                }}
                                onClick={() => {
                                  setSelection({ ...selection, sub: sub });
                                  const itemsInSubcategory = data[selection.cat]?.[sub] || [];
                                  if (itemsInSubcategory.length > 0) {
                                    setActiveCover(Math.floor(Math.random() * itemsInSubcategory.length));
                                  } else {
                                    setActiveCover(0);
                                  }
                                  setReturnToGlobe(false); // Reset memory here!
                                  setLevel(3);
                                }}
                                style={{
                                  position: "absolute",
                                  padding: isMobile ? "8px 12px" : "14px 38px",
                                  borderRadius: "12px",
                                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                                  backdropFilter: "blur(20px) saturate(150%)",
                                  WebkitBackdropFilter:
                                    "blur(20px) saturate(150%)",
                                  border: "1px solid rgba(255, 255, 255, 0.5)",
                                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
                                  fontSize: isMobile ? "9px" : "13px",
                                  fontWeight: "700",
                                  zIndex: 10,
                                  cursor: "pointer",
                                  color: "#000",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {sub.toUpperCase()}
                              </motion.div>
                            </React.Fragment>
                          );
                        }
                      )}

                      <motion.div
                        layoutId={`pill-${selection.cat}`}
                        style={{
                          position: "relative",
                          top: isMobile ? "20px" : "30px",
                          padding: isMobile ? "12px 24px" : "18px 55px",
                          borderRadius: "50px",
                          backgroundColor: "#333",
                          color: "#FFF",
                          fontSize: isMobile ? "10px" : "14px",
                          fontWeight: "700",
                          zIndex: 20,
                          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selection.cat.toUpperCase()}
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              <motion.div
                onClick={handleBack}
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "fixed",
                  bottom: uiEdge,
                  left: uiEdge,
                  width: isMobile ? "40px" : "48px",
                  height: isMobile ? "40px" : "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 5000,
                  color: "#000",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "2px" }}
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </motion.div>

              {level !== 3 && level !== 4 && level !== 5 && (
                <FloatingMapTile 
                  data={data} 
                  isMobile={isMobile} 
                  onClick={handleOverviewClick} 
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
