import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Globe from "react-globe.gl";

// --- LIGHTWEIGHT MINI-GLOBE COMPONENT ---
function MiniGlobe({ data }) {
  const globeRef = useRef();
  const [markers, setMarkers] = useState([]);
  
  const physicalMarkersRef = useRef([]);
  const satellitesRef = useRef([]);
  const offsetRef = useRef(0);

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
    let index = 0
      ;

    if (data) {
      Object.values(data).forEach((subcategories) => {
        Object.values(subcategories).forEach((items) => {
          items.forEach((item) => {
            if (item.lat) {
              const cleanLat = String(item.lat).trim().toUpperCase();

              if (cleanLat === "WEB") {
                const nodeLng = (index * 73) % 360 - 180;
                const inclination = ((index * 53 + 25) % 140) - 70;
                const direction = index % 2 === 0 ? 1 : -1;
                const speedMult = 0.7 + (index % 4) * 0.2;
                const initialPhase = (index * 137.5) % 360;

                satellites.push({
                  id: `web-${index}`, 
                  isWeb: true,
                  nodeLng,
                  inclination,
                  direction,
                  speedMult,
                  initialPhase,
                  lat: 0,
                  lng: nodeLng,
                  altitude: 0.18 + (index % 3) * 0.08,
                });
              } else if (
                !isNaN(parseFloat(item.lat)) &&
                !isNaN(parseFloat(item.lng))
              ) {
                physical.push({
                  id: `geo-${index}`, 
                  isWeb: false,
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lng),
                  altitude: 0.005,
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
        square.style.backgroundColor = d.isWeb ? "#FF" : "#FF007A"; 
        square.style.filter = "blur(1px)"; 
        square.style.borderRadius = "1px";
        
        wrapper.appendChild(square);
        return wrapper;
      }}
    />
  );
}

export default function TopBar({
  isMenuOpen,
  setIsMenuOpen,
  isAboutOpen,
  setIsAboutOpen,
  reset,
  onRandomClick,
  onPopularClick,
  onOverviewClick,
  onGiftGuideClick,
  totalCount,
  allImages = [],
  isMobile,
  data = {},
  onSubcategorySelect,
  onCategorySelect,
}) {
  const [currentItem, setCurrentItem] = useState(null);
  
  const [showRandomBadge, setShowRandomBadge] = useState(false);
  const [hasClickedRandom, setHasClickedRandom] = useState(false);
  const badgeTimerRef = useRef(null);

  const sortedCategories = useMemo(() => {
    return Object.keys(data).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const sortedSubcategories = useMemo(() => {
    const subs = {};
    Object.keys(data).forEach((cat) => {
      subs[cat] = Object.keys(data[cat]).sort((a, b) => a.localeCompare(b));
    });
    return subs;
  }, [data]);

  useEffect(() => {
    const validItems = (allImages || []).filter((item) => {
      const img = typeof item === "string" ? item : item?.image;
      return img && img !== "#" && typeof img === "string";
    });

    if (validItems.length === 0) return;

    const getRandomItem = () =>
      validItems[Math.floor(Math.random() * validItems.length)];

    setCurrentItem(getRandomItem());

    const interval = setInterval(() => {
      setCurrentItem(getRandomItem());
    }, 5000);

    return () => clearInterval(interval);
  }, [allImages?.length]);

  const imgUrl = typeof currentItem === "string" ? currentItem : currentItem?.image;

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.5)", 
    backdropFilter: "blur(24px) saturate(120%)", 
    WebkitBackdropFilter: "blur(24px) saturate(120%)",
    border: "1px solid rgba(255, 255, 255, 0.7)", 
    borderRadius: "12px",
    padding: isMobile ? "20px" : "32px",
    boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
  };

  const cardHeaderStyle = {
    fontFamily: '"Instrument Serif", serif',
    fontSize: "14px",
    fontWeight: "400",
    margin: "0 0 24px 0",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    color: "#000",
    position: "relative",
    zIndex: 2,
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setTimeout(() => setIsAboutOpen(false), 300); 
  };

  const fluidTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
  const springConfig = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <>
      <style>{`
        .hide-global-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
      `}</style>

      <nav
        style={{
          width: "100%",
          height: isMobile ? "60px" : "80px",
          padding: isMobile ? "0 20px" : "0 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10000,
          backgroundColor: "#FFF",
          borderBottom: "1px solid #E5E5E5",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            onClick={() => {
              if (isAboutOpen) {
                setIsAboutOpen(false);
              } else if (isMenuOpen) {
                handleCloseMenu();
              } else {
                setIsMenuOpen(true);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? "5px" : "6px",
              cursor: "pointer",
              width: isMobile ? "36px" : "48px",
              height: isMobile ? "36px" : "48px",
            }}
          >
            <motion.div
              animate={{ 
                rotate: isMenuOpen ? 45 : 0, 
                y: isMenuOpen ? (isMobile ? 7.5 : 9) : 0 
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                width: isMobile ? "24px" : "30px", 
                height: isMobile ? "2.5px" : "3px", 
                backgroundColor: "#000",
                transformOrigin: "center",
              }}
            />
            <motion.div
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                width: isMobile ? "24px" : "30px",
                height: isMobile ? "2.5px" : "3px",
                backgroundColor: "#000",
              }}
            />
            <motion.div
              animate={{ 
                rotate: isMenuOpen ? -45 : 0, 
                y: isMenuOpen ? (isMobile ? -7.5 : -9) : 0 
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                width: isMobile ? "24px" : "30px",
                height: isMobile ? "2.5px" : "3px",
                backgroundColor: "#000",
                transformOrigin: "center",
              }}
            />
          </div>
        </div>

       <div
          onClick={() => { reset(); handleCloseMenu(); }}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "flex-end", // Align bottom edges to font baseline
            cursor: "pointer",
            gap: "6px",
          }}
        >
          {/* --- TYPOGRAPHY LOGO --- */}
          <div style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: isMobile ? "24px" : "30px",
            fontWeight: "400",
            color: "#000",
            letterSpacing: "normal",
            lineHeight: 1,
          }}>
            The Compendium
          </div>

          {/* --- NUMBER BADGE MATCHING X-HEIGHT ('m') --- */}
          <div
            style={{
              border: "1.2px solid #0014FF",
              borderRadius: "4px",
              padding: "0 4px",
              minWidth: isMobile ? "16px" : "19px",
              height: isMobile ? "11px" : "14px", // Matches x-height of "m"
              fontSize: isMobile ? "8px" : "9.5px",
              fontWeight: "700",
              color: "#0014FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              marginBottom: isMobile ? "2px" : "3px", // Aligns bottom edge to "ium" baseline
            }}
          >
            {totalCount || 0}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          
          <AnimatePresence>
            {showRandomBadge && !hasClickedRandom && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  right: "100%", 
                  marginRight: "16px",
                  color: "#000", 
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                RANDOM
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            onMouseEnter={() => {
              if (hasClickedRandom) return;
              if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
              setShowRandomBadge(true);
            }}
            onMouseLeave={() => {
              if (hasClickedRandom) return;
              badgeTimerRef.current = setTimeout(() => {
                setShowRandomBadge(false);
              }, 2000); 
            }}
            onClick={() => {
              setHasClickedRandom(true);
              setShowRandomBadge(false);
              
              if (onRandomClick) onRandomClick(currentItem);
              handleCloseMenu();
              const validItems = (allImages || []).filter((item) => {
                const img = typeof item === "string" ? item : item?.image;
                return img && img !== "#" && typeof img === "string";
              });
              if (validItems.length > 0) {
                setCurrentItem(
                  validItems[Math.floor(Math.random() * validItems.length)]
                );
              }
            }}
            whileHover={{ scale: isMobile ? 1 : 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: isMobile ? "28px" : "36px", 
              height: isMobile ? "28px" : "36px", 
              backgroundColor: "#E5E5E5",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "4px",
            }}
          >
            {imgUrl && (
              <img
                src={imgUrl}
                alt=""
                onLoad={(e) => { e.target.style.display = "block"; }}
                onError={(e) => { e.target.style.display = "none"; }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(2)",
                  imageRendering: "pixelated",
                  WebkitImageRendering: "pixelated",
                }}
              />
            )}
          </motion.div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseMenu}
            style={{
              position: "fixed",
              top: isMobile ? "60px" : "80px",
              left: 0,
              width: "100vw",
              height: isMobile ? "calc(100vh - 60px)" : "calc(100vh - 80px)",
              zIndex: 9999,
              backgroundColor: "rgba(242, 242, 242, 0.5)", 
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center", 
              overflow: "hidden" 
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "860px",
                height: isMobile ? "calc(100% - 40px)" : "584px",
                margin: "20px",
              }}
            >
              <AnimatePresence>
                {!isAboutOpen && (
                  <motion.div
                    key="menu-grid"
                    className="hide-global-scrollbar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, pointerEvents: "none" }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: isMobile ? "flex-start" : "center", 
                      gap: "24px",
                      overflowY: "auto", 
                      paddingBottom: isMobile ? "40px" : "0", 
                      scrollbarWidth: "none", 
                      msOverflowStyle: "none", 
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: isMobile ? "100%" : "280px", flexShrink: 0 }}>
                      
                      <motion.div
                        layoutId="morph-card"
                        transition={fluidTransition}
                        style={{ ...cardStyle, height: isMobile ? "auto" : "280px", flexShrink: 0 }}
                      >
                        <h3 style={cardHeaderStyle}>GENERAL</h3>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px", 
                            fontSize: "12px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {[
                            { label: "ABOUT", action: () => setIsAboutOpen(true) },
                            { label: "RANDOM", action: () => { if (onRandomClick) onRandomClick(); handleCloseMenu(); } },
                            { label: "EVERYTHING", action: () => { if (onOverviewClick) onOverviewClick(); handleCloseMenu(); } },
                            { label: "MOST POPULAR", action: () => { if (onPopularClick) onPopularClick(); handleCloseMenu(); } },
                            { label: "GIFT GUIDE", action: () => { if (onGiftGuideClick) onGiftGuideClick(); handleCloseMenu(); } }
                          ].map((link) => (
                            <motion.span
                              key={link.label}
                              whileHover={{ x: 4, color: "#666" }}
                              transition={{ duration: 0.2 }}
                              onClick={link.action}
                              style={{ cursor: "pointer", padding: "4px 0", display: "inline-block" }}
                            >
                              {link.label}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>

                      <div 
                        onClick={() => {
                          if (onOverviewClick) onOverviewClick("map");
                          handleCloseMenu();
                        }}
                        style={{ ...cardStyle, height: isMobile ? "160px" : "280px", position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
                      >
                        <h3 style={cardHeaderStyle}>MAP</h3>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -40%)",
                            pointerEvents: "none", 
                            width: "180px", 
                            height: "180px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <MiniGlobe data={data} />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      layout
                      initial={{ opacity: 0, width: 0, marginLeft: -24 }}
                      animate={{ opacity: 1, width: isMobile ? "100%" : "280px", marginLeft: 0 }}
                      exit={{ opacity: 0, width: 0, marginLeft: -24, padding: 0, borderWidth: 0 }}
                      transition={springConfig}
                      style={{
                        ...cardStyle,
                        height: isMobile ? "65vh" : "584px", 
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden", 
                        flexShrink: 0
                      }}
                    >
                      <h3 style={{ ...cardHeaderStyle, flexShrink: 0 }}>CATEGORY OVERVIEW</h3>
                      
                      <div 
                        className="custom-scrollbar" 
                        style={{ 
                          flex: 1, 
                          overflowY: "auto", 
                          minHeight: 0,
                          marginRight: isMobile ? "-8px" : "-24px", 
                          paddingRight: isMobile ? "8px" : "24px", 
                          paddingBottom: "10px" 
                        }}
                      >
                        {sortedCategories.map((cat, index) => {
                          const sortedSubs = sortedSubcategories[cat];
                          return (
                            <React.Fragment key={cat}>
                              <div style={{ paddingBottom: "8px" }}>
                                <motion.h4
                                  whileHover={{ x: 3, color: "#444" }}
                                  transition={{ duration: 0.2 }}
                                  onClick={() => {
                                    if (onCategorySelect) onCategorySelect(cat);
                                    handleCloseMenu();
                                  }}
                                  style={{
                                    fontFamily: '"Geist", sans-serif',
                                    fontSize: "16px", 
                                    fontWeight: "800",
                                    margin: "0 0 12px 0",
                                    textTransform: "uppercase", 
                                    cursor: "pointer",
                                    display: "inline-block",
                                    padding: "4px 0"
                                  }}
                                >
                                  {cat}
                                </motion.h4>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {sortedSubs.map((sub) => {
                                    const itemCount = data[cat][sub]?.length || 0;
                                    return (
                                      <motion.div
                                        key={sub}
                                        initial="initial"
                                        whileHover="hover"
                                        onClick={() => {
                                          if (onSubcategorySelect) onSubcategorySelect(cat, sub);
                                          handleCloseMenu();
                                        }}
                                        style={{ 
                                          cursor: "pointer", 
                                          padding: "4px 0", 
                                          display: "flex", 
                                          alignItems: "center",
                                          gap: "6px",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          textTransform: "uppercase", 
                                          letterSpacing: "0.02em",
                                        }}
                                      >
                                        <motion.span variants={{ initial: { x: 0, color: "#000" }, hover: { x: 4, color: "#666" } }} transition={{ duration: 0.2 }}>
                                          {sub}
                                        </motion.span>
                                        <motion.span variants={{ initial: { opacity: 0, x: 0 }, hover: { opacity: 0.4, x: 4 } }} transition={{ duration: 0.2 }} style={{ fontSize: "10px", fontWeight: "700" }}>
                                          [{itemCount}]
                                        </motion.span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                              {index < sortedCategories.length - 1 && (
                                <div style={{ height: "1px", width: "16px", backgroundColor: "#000", margin: "24px 0" }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isAboutOpen && (
                  <motion.div
                    key="about-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, pointerEvents: "none" }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      zIndex: 20,
                      display: "flex",
                      alignItems: isMobile ? "flex-start" : "center",
                      justifyContent: "center",
                      overflowY: "auto",
                      paddingBottom: isMobile ? "40px" : 0
                    }}
                  >
                    <motion.div
                      layoutId="morph-card"
                      transition={fluidTransition}
                      style={{
                        ...cardStyle, 
                        width: "100%", 
                        maxWidth: "560px",
                        height: "auto",
                        display: "flex", flexDirection: "column",
                        padding: isMobile ? "30px 24px" : "48px 48px",
                        position: "relative",
                        color: "#000"
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: 0.15 }} 
                        style={{ display: "flex", flexDirection: "column", width: "100%" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                          <div style={{
                            fontFamily: '"Instrument Serif", serif',
                            fontSize: "14px",
                            fontWeight: "400",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            color: "#666" 
                          }}>
                            ABOUT
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); setIsAboutOpen(false); }}
                            style={{
                              cursor: "pointer",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: "-4px",
                              marginRight: "-4px"
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </motion.div>
                        </div>
                        
                        <p style={{
                          fontFamily: '"Geist", sans-serif',
                          fontSize: isMobile ? "18px" : "22px",
                          lineHeight: "1.4",
                          fontWeight: "400",
                          color: "#000",
                          margin: "0 0 40px 0",
                          letterSpacing: "-0.01em"
                        }}>
                          <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: isMobile ? "20px" : "24px", fontWeight: "400" }}>This is a second brain.</span> The Compendium is a collection of interesting brands, places and people that stood out over the years. This list was created to give credit to the brands and the people behind them - and to make their work accessible to a wider audience.
                        </p>
                        
                        <p style={{
                          fontFamily: '"Geist", sans-serif',
                          fontSize: isMobile ? "18px" : "22px",
                          fontWeight: "400",
                          color: "#000",
                          margin: "0 0 48px 0",
                          letterSpacing: "-0.01em"
                        }}>
                          Stay curious <span style={{ fontFamily: '"Instrument Serif", serif', fontWeight: "400", fontSize: isMobile ? "20px" : "24px", fontStyle: "normal" }}>&</span> enjoy digging.
                        </p>
                        
                        <a
                          href="mailto:compendium.explore@gmail.com"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end", 
                            borderTop: "1px solid rgba(0,0,0,1)", 
                            paddingTop: "16px",
                            textDecoration: "none",
                            color: "#000",
                            cursor: "pointer"
                          }}
                        >
                          <p style={{
                            fontFamily: '"Geist", sans-serif',
                            fontSize: "10px",
                            fontWeight: "500",
                            margin: 0,
                            maxWidth: "80%",
                            lineHeight: "1.4",
                            letterSpacing: "0.01em"
                          }}>
                            If you do not want yourself or your brand featured,<br/>please reach out and it will be taken down.
                          </p>
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor" style={{ marginBottom: "2px" }}>
                            <path d="M6.4 18L5 16.6L14.6 7H6V5h12v12h-2V8.4L6.4 18Z" />
                          </svg>
                        </a>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
