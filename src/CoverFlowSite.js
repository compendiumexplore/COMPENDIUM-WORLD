import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DOMAINS THAT REJECT BOTS ENTIRELY ---
const SOCIAL_BLACKLIST = [
  "instagram.com",
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
];

// --- DOMAINS THAT BLOCK IFRAMES BUT ALLOW SCREENSHOTS ---
const IFRAME_BLACKLIST = [
  "github.com",
  "leftkiss.com",
  "gast.studio",
  "nemesis.global",
  "deck.gallery",
  "re-publica.com",
  "3daysofdesign.dk",
  "stokeberlin.com",
  "jmberlin.de",
  "nanamica.com",
  "vinnysthevibe.com",
  "clints.co",
  "kleman-france.com",
  "sebago.com",
  "wildbunchstyles.com",
  "maharishistore.com",
  "merci-merci.com",
  "packershoes.com",
  "solitudemtg.com",
  "sacai.jp",
  "jieda.store",
  "rotholz-store.com",
  "jannjune.com",
  "gramicci.com",
  "brut-clothing.com",
  "global.danner.com",
  "capable.design",
  "the-internetshop.com",
  "merrell.com",
  "yayuworld.com",
  "tracksuitbae.com",
  "hunidesign.com",
  "soulland.com",
  "anotheraspect.org",
  "srnali.com",
  "ydot-official.com",
  "de.soeur.fr",
  "village-pm.com",
  "eliseestelle.com",
  "simuero.com",
  "bleueburnham.com",
  "octi.uk",
  "shop.tabisuketabizo.jp",
  "roa-hiking.com",
  "altrarunning.eu",
  "districtvision.com",
  "rollosocks.com",
  "fingerscrossed.design",
  "unna.com",
  "odlo.com",
  "soarrunning.com",
  "doxarun.com",
  "kutadistancelab.com",
  "handshake-running.com",
  "attaquercycling.com",
  "portal-brand.com",
  "thisthingofours.co.uk",
  "ln-cc.com",
  "arysstore.com",
  "voostore.com",
  "lelabostore.com",
  "knudpeters.com",
  "lagunecph.com",
  "careofcarl.com",
  "universalworks.com",
  "norseprojects.com",
  "hastparis.com",
  "casatlantic.com",
  "oliverspencer.co.uk",
  "bernerkuhl.com",
  "janmachenhauer.com",
  "soshiotsuki.store",
  "auralee.jp",
  "studionicholson.com",
  "barenavenezia.com",
  "mfpen.com",
  "leaboberg.com",
  "lemaire.fr",
  "filippa-k.com",
  "conflictfood.com",
  "tomorrow.one",
  "8-natur.com",
  "marleenwrage.com",
  "studiolinne.de",
  "audocph.com",
  "objekteunserertage.com",
  "flos.com",
  "dcw-editions.com",
  "midgard.com",
  "oblist.com",
  "tanchenstudio.com",
  "campeggidesign.it",
  "grau.art",
  "standardproducts.jp",
  "mo-and-a.com",
  "mariotsai.com",
  "luce-luce.de",
  "veark.com",
  "mono.de",
  "assos.com",
  "italomecano.com",
  "ridealso.com",
  "cervelo.com",
  "pinarello.com",
  "specialized.com",
  "nts.live",
  "seoulcommunityradio.com",
  "otaku-records.de",
  "kiwi-verlag.de",
  "brandeins.de",
  "theposterclub.com",
  "drool-art.com",
  "teknostudio.art",
  "kiblind-atelier.com",
  "inesgradotstudio.bigcartel.com",
  "quintalatelier.com",
  "shrigshop.com",
  "mamama-paris.com",
  "actualsource.org",
  "daisysound.com",
  "de.nothing.tech",
  "atonemo.com",
  "awmagazin.de",
  "sydmead.com",
  "stephensmithillustration.com",
  "nickdahlen1.bigcartel.com",
  "yayabe.store",
  "research.mouthwash.studio",
  "deathtothestockphoto.com",
  "fonts.google.com",
  "stills.com",
  "fat-international.com",
];

export default function CoverFlowSite({
  items,
  activeIndex,
  category,
  subcategory,
  onSwipe,
  isMobile,
  width,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- CENTRALIZED DSGVO CONSENT STATE ---
  const [consentStatus, setConsentStatus] = useState(() => {
    return typeof window !== "undefined" ? sessionStorage.getItem("compendium_consent") : null;
  });
  
  const hasConsent = consentStatus === "granted";

  const lastSwipeTimeRef = useRef(0);

  const safeSwipe = (offset) => {
    if (consentStatus === null) return;
    
    const now = Date.now();
    if (now - lastSwipeTimeRef.current < 400) return;
    lastSwipeTimeRef.current = now;
    onSwipe(offset);
  };

  useEffect(() => {
    const forceScrollToZero = () => {
      if (document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop > 0) {
        document.body.scrollTop = 0;
      }
    };
    window.addEventListener("scroll", forceScrollToZero);
    return () => window.removeEventListener("scroll", forceScrollToZero);
  }, []);

  useEffect(() => {
    const activeItem = items[activeIndex];
    setIsBlocked(false);
    setIsLoading(false);
    setScreenshotUrl(null);
    setPreviewUrl(null);

    if (!hasConsent) return;

    const timer = setTimeout(() => {
      if (activeItem && activeItem.website !== "#") {
        const urlToCheck = activeItem.website.toLowerCase();

        const isSocialBlocked = SOCIAL_BLACKLIST.some((domain) =>
          urlToCheck.includes(domain)
        );
        const isIframeBlocked = IFRAME_BLACKLIST.some((domain) =>
          urlToCheck.includes(domain)
        );

        if (isSocialBlocked || urlToCheck.startsWith("http://")) {
          setIsBlocked(true);
          setPreviewUrl(null);
          setIsLoading(false);
        } else if (isIframeBlocked) {
          setIsBlocked(false);
          setPreviewUrl(null);
          setScreenshotUrl(
            `https://api.microlink.io/?url=${encodeURIComponent(
              activeItem.website
            )}&screenshot=true&meta=false&embed=screenshot.url&screenshot.type=jpeg`
          );
          setIsLoading(true);
        } else {
          setPreviewUrl(activeItem.website);
          setIsBlocked(false);
          setIsLoading(true);
        }
      } else {
        setPreviewUrl(null);
        setIsBlocked(false);
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeIndex, items, hasConsent]);

  const cardSize = isMobile ? width * 0.85 : 580;
  const cardOffsetBase = isMobile ? cardSize / 2 + 20 : 400;
  const spacingMultiplier = isMobile ? 50 : 105;

  const metaStyle = {
    fontSize: isMobile ? "9px" : "11px",
    fontWeight: "800",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#000",
    whiteSpace: "nowrap",
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (consentStatus === null) return;
      if (e.key === "ArrowRight") safeSwipe(1);
      else if (e.key === "ArrowLeft") safeSwipe(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSwipe, consentStatus]);

  const getMasterLayout = (itemList) => {
    if (!itemList.length)
      return { fontSize: isMobile ? "40px" : "60px", wrap: false };
    const longest = itemList.reduce(
      (max, item) => (item.name.length > max.length ? item.name : max),
      ""
    );
    const charCount = longest.length;
    const wordCount = longest.split(/\s+/).filter((w) => w.length > 0).length;
    const shouldWrap = charCount > 12 && wordCount > 1;

    let fontSize;
    if (shouldWrap) {
      if (charCount > 25) fontSize = isMobile ? "22px" : "32px";
      else if (charCount > 18) fontSize = isMobile ? "28px" : "42px";
      else fontSize = isMobile ? "34px" : "52px";
    } else {
      if (charCount > 20) fontSize = isMobile ? "18px" : "22px";
      else if (charCount > 15) fontSize = isMobile ? "24px" : "30px";
      else if (charCount > 12) fontSize = isMobile ? "30px" : "40px";
      else if (charCount > 8) fontSize = isMobile ? "40px" : "58px";
      else fontSize = isMobile ? "55px" : "95px";
    }
    return { fontSize, wrap: shouldWrap };
  };

  const layout = getMasterLayout(items);
  const stopProp = (e) => e.stopPropagation();

  return (
    <>
      <div
        style={{
          width: "100%",
          height: isMobile ? "calc(100vh - 60px)" : "calc(100vh - 80px)",
          marginTop: isMobile ? "60px" : "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "clip",
          boxSizing: "border-box",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <div
          style={{
            display: "flex",
            perspective: "2000px",
            transformStyle: "preserve-3d",
            height: `${cardSize}px`,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {items.map((item, i) => {
            const offset = i - activeIndex;
            const isActive = offset === 0;
            const isNearby = Math.abs(offset) <= 2;

            const rotateY = isActive ? 0 : offset > 0 ? -60 : 60;
            const translateX = isActive
              ? 0
              : offset > 0
              ? offset * spacingMultiplier + cardOffsetBase
              : offset * spacingMultiplier - cardOffsetBase;
            const translateZ = isActive ? 0 : -450 - Math.abs(offset) * 150;

            return (
              <motion.div
                key={i}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                dragSnapToOrigin={true}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50) safeSwipe(1);
                  else if (info.offset.x > 50) safeSwipe(-1);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive) safeSwipe(offset);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                animate={{
                  x: translateX,
                  z: translateZ,
                  rotateY: rotateY,
                  opacity: Math.abs(offset) > 3 ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 28 }}
                style={{
                  width: `${cardSize}px`,
                  height: `${cardSize}px`,
                  position: "absolute",
                  zIndex: isActive ? 5500 : 1,
                  backfaceVisibility: "hidden",
                  pointerEvents: Math.abs(offset) > 3 || consentStatus === null ? "none" : "auto",
                  cursor: isActive ? "grab" : "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  touchAction: "manipulation",
                }}
                whileTap={{ cursor: isActive ? "grabbing" : "pointer" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#FFF",
                    borderRadius: isMobile ? "12px" : "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    boxShadow: isActive
                      ? "0 50px 120px rgba(0,0,0,0.15)"
                      : "0 10px 40px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* TOP 76% IMAGE/IFRAME AREA */}
                  <div
                    style={{
                      width: "100%",
                      height: "76%",
                      minHeight: 0, 
                      backgroundColor: "#1A1A1A",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {item.image && isNearby ? (
                      <img
                        src={item.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                        alt={item.name}
                        fetchPriority={isActive ? "high" : "auto"}
                        loading="eager"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#1A1A1A",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    )}

                    <AnimatePresence>
                      {isActive && hasConsent && !isMobile && !isBlocked && (
                        <>
                          {previewUrl === item.website && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoading ? 0 : 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 10,
                                backgroundColor: "#FFF",
                              }}
                              onPointerDown={stopProp}
                            >
                              <iframe
                                src={previewUrl}
                                title={`${item.name} preview`}
                                onLoad={() => setIsLoading(false)}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                }}
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                              />
                            </motion.div>
                          )}

                          {screenshotUrl && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoading ? 0 : 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 10,
                                backgroundColor: "#F2F2F2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={screenshotUrl}
                                alt={`${item.name} screenshot preview`}
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                  setScreenshotUrl(null);
                                  setIsBlocked(true);
                                  setIsLoading(false);
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "top center",
                                }}
                              />
                            </motion.div>
                          )}
                        </>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isActive && hasConsent && isBlocked && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: isMobile ? "24px" : "32px",
                            backgroundColor: "#0014FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 50,
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              color: "#FFF",
                              fontSize: isMobile ? "9px" : "11px",
                              fontWeight: "800",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            SORRY – WEBSITE PREVIEW NOT AVAILABLE
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isActive && hasConsent && isLoading && !isBlocked && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: "absolute",
                            bottom: 0, 
                            left: 0,
                            width: "100%",
                            height: isMobile ? "2px" : "3px",
                            backgroundColor: "rgba(0, 0, 0, 0.08)",
                            zIndex: 50,
                            pointerEvents: "none",
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "90%" }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            style={{
                              height: "100%",
                              backgroundColor: "#0014FF",
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* BOTTOM 24% TEXT AREA */}
                  <div
                    style={{
                      width: "100%",
                      height: "24%",
                      minHeight: 0, 
                      padding: isMobile ? "8px 10px" : "14px 22px", 
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                      backgroundColor: "#FFF", 
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isMobile ? "20px" : "65px",
                        width: "100%",
                        marginBottom: isMobile ? "4px" : "8px",
                        overflow: "hidden",
                        flexShrink: 0, 
                      }}
                    >
                      <div style={metaStyle}>
                        {item.category || category} /{" "}
                        {item.subcategory || subcategory}
                      </div>
                      <div style={metaStyle}>{item.location}</div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flex: 1,
                      }}
                    >
                      <div style={{ width: "75%", overflow: "visible" }}>
                        <h2
                          style={{
                            fontSize: layout.fontSize,
                            fontWeight: "700",
                            letterSpacing: "-0.06em",
                            lineHeight: "0.85",
                            margin: 0,
                            whiteSpace: layout.wrap ? "normal" : "nowrap",
                            wordBreak: "keep-all",
                            textTransform: "none",
                          }}
                        >
                          {item.name}
                        </h2>
                      </div>
                      <div
                        style={{
                          width: "25%",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          pointerEvents: "auto",
                        }}
                      >
                        <motion.a
                          href={item.website !== "#" ? item.website : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            color: "#000",
                            textDecoration: "none",
                          }}
                          whileHover={{ scale: 1.1, x: 2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={stopProp}
                          onMouseDown={stopProp}
                          onPointerDown={stopProp}
                          onTouchStart={stopProp}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height={isMobile ? "28" : "36"}
                            viewBox="0 0 24 24"
                            width={isMobile ? "28" : "36"}
                            fill="currentColor"
                          >
                            <path d="M6.4 18L5 16.6L14.6 7H6V5h12v12h-2V8.4L6.4 18Z" />
                          </svg>
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- TRUE CENTERED CONSENT MODAL --- */}
      <AnimatePresence>
        {consentStatus === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 10005, 
              backgroundColor: "rgba(242, 242, 242, 0.6)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              style={{
                width: "calc(100% - 40px)",
                maxWidth: "460px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(24px) saturate(120%)",
                WebkitBackdropFilter: "blur(24px) saturate(120%)",
                borderRadius: "16px",
                padding: isMobile ? "24px" : "32px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <p style={{ 
                margin: 0, 
                fontSize: isMobile ? "14px" : "15px", 
                fontFamily: '"Geist", sans-serif', 
                color: "#000", 
                lineHeight: "1.5" 
              }}>
                <strong style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
                  Enhance your experience
                </strong>
                We load live interactive previews of the featured projects. Enabling this connects you to external third-party servers, which will process your IP address. For details, see our Privacy Policy.
              </p>
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button
                  onClick={() => {
                    setConsentStatus("granted");
                    sessionStorage.setItem("compendium_consent", "granted");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#0014FF",
                    color: "#FFF",
                    border: "none",
                    fontWeight: "700",
                    fontSize: isMobile ? "11px" : "12px",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase"
                  }}
                >
                  Load Live Previews
                </button>
                <button
                  onClick={() => {
                    setConsentStatus("denied");
                    sessionStorage.setItem("compendium_consent", "denied");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    color: "#000",
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontWeight: "700",
                    fontSize: isMobile ? "11px" : "12px",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase"
                  }}
                >
                  Limit my experience
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}