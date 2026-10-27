/* =============================================
   INVITACIÓN DE BODA — Diego & Silvia
   Script: Scroll-Out Paper Animation + Firebase
   ============================================= */

// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcLcLCOJpAyCLnTPHR3EDCuZmuqJDDr2g",
  authDomain: "boda-diego-silvia-2027.firebaseapp.com",
  projectId: "boda-diego-silvia-2027",
  storageBucket: "boda-diego-silvia-2027.firebasestorage.app",
  messagingSenderId: "766070088424",
  appId: "1:766070088424:web:11a6d68ebd2c4bb1179f5d"
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not configured yet:", e.message);
}

// ===================== DOM ELEMENTS =====================
const pageLoader = document.getElementById("pageLoader");
const paper = document.getElementById("paper");
const envelopeFlap = document.getElementById("envelopeFlap");
const waxSeal = document.getElementById("waxSeal");
const scrollHint = document.getElementById("scrollHint");

const rsvpForm = document.getElementById("rsvpForm");
const submitBtn = document.getElementById("submitBtn");
const successFeedback = document.getElementById("successFeedback");
const errorFeedback = document.getElementById("errorFeedback");
const allergiesGroup = document.getElementById("allergiesGroup");

// ===================== INITIALIZATION =====================
function initScrollHeight() {
  if (!paper) return;
  // Calculate total required scroll distance:
  // 300px to fully open the envelope flap
  // + paper.offsetHeight to slide the paper entirely out of the envelope
  // + half window height so the user can scroll a bit past the bottom
  const totalScroll = 300 + paper.offsetHeight + (window.innerHeight * 0.5);
  document.body.style.height = `${totalScroll}px`;
}

window.addEventListener("load", () => {
  initScrollHeight();
  
  // Fade out loader
  setTimeout(() => {
    pageLoader.style.opacity = "0";
    setTimeout(() => {
      pageLoader.style.display = "none";
      // Ensure height is correct after font load/render
      initScrollHeight();
    }, 500);
  }, 500);
});

// Recalculate on window resize
window.addEventListener("resize", initScrollHeight);

// ===================== SCROLL LOGIC =====================
let ticking = false;

function onScroll() {
  const scrollY = window.scrollY;

  // 1. Envelope Flap Opens (0 to 300px)
  let flapProgress = Math.min(1, Math.max(0, scrollY / 300));
  // Add an easing curve so it feels natural
  let easedFlap = flapProgress < 0.5 ? 2 * flapProgress * flapProgress : -1 + (4 - 2 * flapProgress) * flapProgress;
  envelopeFlap.style.transform = `translateX(-50%) rotateX(${easedFlap * 180}deg)`;

  // Wax seal fades smoothly
  if (scrollY > 50) {
    let sealFade = Math.min(1, (scrollY - 50) / 150);
    waxSeal.style.opacity = 1 - sealFade;
  } else {
    waxSeal.style.opacity = 1;
  }

  // 2. Paper Slides Out (After 300px)
  if (scrollY > 300) {
    const movePx = scrollY - 300;
    // Translate Y pushes the paper UP as user scrolls DOWN
    paper.style.transform = `translateX(-50%) translateY(-${movePx}px)`;
  } else {
    paper.style.transform = `translateX(-50%) translateY(0px)`;
  }

  // 3. Hide Scroll Hint
  if (scrollY > 15) {
    scrollHint.style.opacity = "0";
  } else {
    scrollHint.style.opacity = "1";
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

// Initial call to set correct state
onScroll();

// ===================== FORM LOGIC =====================
const radioButtons = document.querySelectorAll('input[name="asistencia"]');

radioButtons.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "ceremonia_y_celebracion") {
      allergiesGroup.classList.add("visible");
    } else {
      allergiesGroup.classList.remove("visible");
      document.getElementById("allergies").value = "";
    }
    // Update scroll height since form size changed
    setTimeout(initScrollHeight, 300); 
  });
});

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = "ENVIANDO...";
    
    const formData = {
      nombre: document.getElementById("guestName").value.trim(),
      acompanantes: parseInt(document.getElementById("guestCount").value),
      asistencia: document.querySelector('input[name="asistencia"]:checked').value,
      alergias: document.getElementById("allergies").value.trim() || "",
      mensaje: document.getElementById("guestMessage").value.trim() || "",
      timestamp: serverTimestamp(),
    };
    
    try {
      if (!db) throw new Error("Firebase no configurado");
      
      await addDoc(collection(db, "invitados"), formData);
      
      rsvpForm.style.display = "none";
      successFeedback.style.display = "block";
      
      // Update scroll height
      setTimeout(initScrollHeight, 100);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      errorFeedback.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "CONFIRMAR";
      
      setTimeout(() => {
        errorFeedback.style.display = "none";
        initScrollHeight();
      }, 5000);
    }
  });
}
