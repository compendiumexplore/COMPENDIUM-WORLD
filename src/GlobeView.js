import React, { useState, useEffect, useRef, useCallback } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobeView({ items, isMobile, onMarkerClick }) {
  const globeRef = useRef();
  const popupRef = useRef(null);

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isOverGlobe, setIsOverGlobe] = useState(false);
  const [markers, setMarkers] = useState([]);

  const physicalMarkersRef = useRef([]);
  const satellitesRef = useRef([]);
  const offsetRef = useRef(0);
  const isHoveredRef = useRef(false);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (popupRef.current) {
        popupRef.current.style.top = `${e.clientY - 25}px`;
        popupRef.current.style.left = `${e.clientX + 18}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: isMobile ? 3 : 2.2 });
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const physical = [];
    const satellites = [];

    (items || []).forEach((item, index) => {
      if (!item.lat || item.lat === "" || String(item.lat).includes("Loading"))
        return;

      const cleanLatString = String(item.lat).replace(/["']/g, "").trim();
      const cleanLngString = String(item.lng).replace(/["']/g, "").trim();
      const cleanLatUpper = cleanLatString.toUpperCase();

      if (cleanLatUpper === "WEB") {
        const nodeLng = (index * 73) % 360 - 180;
        const inclination = ((index * 53 + 25) % 140) - 70;
        const direction = index % 2 === 0 ? 1 : -1;
        const speedMult = 0.7 + (index % 4) * 0.2;
        const initialPhase = (index * 137.5) % 360;

        satellites.push({
          id: `web-${item.id || index}`,
          itemData: item,
          nodeLng,
          inclination,
          direction,
          speedMult,
          initialPhase,
          lat: 0,
          lng: nodeLng,
          altitude: 0.18 + (index % 3) * 0.08,
        });
      } else {
        let parsedLat, parsedLng;

        if (cleanLatString.includes(",")) {
          const parts = cleanLatString.split(",");
          parsedLat = parseFloat(parts[0]);
          parsedLng = parseFloat(parts[1]);
        } else {
          parsedLat = parseFloat(cleanLatString);
          parsedLng = parseFloat(cleanLngString);
        }

        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          physical.push({
            id: `geo-${item.id || index}`,
            itemData: item,
            lat: parsedLat,
            lng: parsedLng,
            altitude: 0.005,
          });
        }
      }
    });

    physicalMarkersRef.current = physical;
    satellitesRef.current = satellites;
    setMarkers([...physical, ...satellites]);
  }, [items]);

  useEffect(() => {
    let animFrame;
    const animate = () => {
      if (!isHoveredRef.current) {
        offsetRef.current = (offsetRef.current + 0.024) % 360;
        const offset = offsetRef.current;

        satellitesRef.current.forEach((sat) => {
          const totalAngleDeg = sat.initialPhase + offset * sat.direction * sat.speedMult;
          const theta = (totalAngleDeg * Math.PI) / 180;
          const incRad = (sat.inclination * Math.PI) / 180;

          const latRad = Math.asin(Math.sin(incRad) * Math.sin(theta));
          const lngRad = Math.atan2(Math.cos(incRad) * Math.sin(theta), Math.cos(theta));

          const calculatedLat = (latRad * 180) / Math.PI;
          let calculatedLng = sat.nodeLng + (lngRad * 180) / Math.PI;

          calculatedLng = (((calculatedLng + 180) % 360) + 360) % 360 - 180;

          sat.lat = calculatedLat;
          sat.lng = calculatedLng;
        });

        setMarkers([...physicalMarkersRef.current, ...satellitesRef.current]);
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const handleGlobeHover = useCallback((globeObj) => {
    setIsOverGlobe(!!globeObj);
  }, []);

  const renderHtmlElement = useCallback((d) => {
    const wrapper = document.createElement("div");
    wrapper.style.pointerEvents = "auto";
    wrapper.style.cursor = "pointer";
    wrapper.style.transform = "translate(-50%, -50%)";

    const isPhysical = d.id && d.id.startsWith("geo-");
    const markerColor = isPhysical ? "#FF007A" : "#0014FF";
    const markerSize = isPhysical ? "8px" : "14px"; 
    const markerBlur = isPhysical ? "blur(1.5px)" : "blur(3px)"; 

    const square = document.createElement("div");
    square.style.width = markerSize;
    square.style.height = markerSize;
    square.style.backgroundColor = markerColor;
    square.style.filter = markerBlur;
    square.style.borderRadius = "2px";
    square.style.cursor = "pointer";
    square.style.transition = "transform 0.15s ease";

    wrapper.appendChild(square);

    // --- NEW: THE CLICK HANDLER ---
    wrapper.onclick = (e) => {
      e.stopPropagation();
      if (onMarkerClick) {
        onMarkerClick(d.itemData);
      }
    };

    wrapper.onmouseenter = (e) => {
      e.stopPropagation();
      isHoveredRef.current = true;

      if (globeRef.current && globeRef.current.controls()) {
        globeRef.current.controls().autoRotate = false;
      }

      square.style.transform = "scale(1.8)";

      if (popupRef.current) {
        popupRef.current.style.top = `${e.clientY - 25}px`;
        popupRef.current.style.left = `${e.clientX + 18}px`;
      }

      setHoveredItem(d.itemData);
    };

    wrapper.onmouseleave = (e) => {
      e.stopPropagation();
      isHoveredRef.current = false;

      if (globeRef.current && globeRef.current.controls()) {
        globeRef.current.controls().autoRotate = true;
      }

      square.style.transform = "scale(1)";
      setHoveredItem(null);
    };

    return wrapper;
  }, [onMarkerClick]);

  const activeCursor = isGrabbing
    ? "grabbing"
    : isOverGlobe
    ? "grab"
    : "default";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#E5E5E5",
        zIndex: 10,
        overflow: "hidden",
        fontFamily: '"IBM Plex Sans", sans-serif',
        cursor: "default",
      }}
    >
      <div
        onMouseDown={() => setIsGrabbing(true)}
        onMouseUp={() => setIsGrabbing(false)}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "60px",
          boxSizing: "border-box",
          cursor: activeCursor,
        }}
      >
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          htmlTransitionDuration={0}
          htmlElementsData={markers}
          onGlobeHover={handleGlobeHover}
          htmlElement={renderHtmlElement}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="altitude"
        />
      </div>

      <AnimatePresence>
        {hoveredItem && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            // --- UPDATED LIQUID GLASS STYLE HERE ---
            style={{
              position: "fixed",
              backgroundColor: "rgba(255, 255, 255, 0.6)", 
              backdropFilter: "blur(24px) saturate(120%)", 
              WebkitBackdropFilter: "blur(24px) saturate(120%)",
              border: "1px solid rgba(255, 255, 255, 0.7)", 
              borderRadius: "12px", 
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              zIndex: 9000,
              pointerEvents: "none",
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.1)", 
              whiteSpace: "nowrap",
            }}
          >
            {hoveredItem.image && hoveredItem.image !== "#" && (
              <img
                src={hoveredItem.image}
                alt={hoveredItem.name}
                style={{
                  width: "44px",
                  height: "44px",
                  objectFit: "cover",
                  borderRadius: "6px", // Smooth rounded corners for the thumbnail
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "800",
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {hoveredItem.category} / {hoveredItem.subcategory}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  lineHeight: "1.1",
                  marginTop: "2px",
                }}
              >
                {hoveredItem.name}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: String(hoveredItem.lat).trim().toUpperCase() === "WEB" ? "#0014FF" : "#FF007A",
                  marginTop: "2px",
                  textTransform: "uppercase",
                }}
              >
                {hoveredItem.location}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}