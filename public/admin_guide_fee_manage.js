// admin_guide_fee_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhfTLaqtp1BVUa_iPbksW15Ah0CE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
  measurementId: "G-KN3EQNZWLN"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let courseMap = {};

window.onload = async function () {
  const snapshot = await getDocs(collection(db, 'courses'));
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");

  const countries = new Set();
  courseMap = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    countries.add(data.country);
    if (!courseMap[data.country]) courseMap[data.country] = [];
    courseMap[data.country].push(data.course);
  });

  [...countries].sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.innerText = c;
    countrySelect.appendChild(opt);
  });

  countrySelect.onchange = () => {
    const selected = countrySelect.value;
    courseSelect.innerHTML = "";
    (courseMap[selected] || []).sort().forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.innerText = c;
      courseSelect.appendChild(opt);
    });
    courseSelect.dispatchEvent(new Event("change"));
  };

  courseSelect.onchange = () => {
    const c = countrySelect.value;
    const k = courseSelect.value;
    const t = document.getElementById("tourType").value;
    loadExistingGuideFees(c, k, t);
  };

  document.getElementById("tourType").onchange = () => {
    const c = countrySelect.value;
    const k = courseSelect.value;
    const t = document.getElementById("tourType").value;
    loadExistingGuideFees(c, k, t);
  };

  countrySelect.dispatchEvent(new Event("change"));
};

async function loadExistingGuideFees(country, course, type) {
  const key = `${country}_${course}`;
  const ref = doc(db, "guideFees", key);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const guideData = data[type]?.guide || {};
    const hotelData = data[type]?.hotel || {};
    for (let i = 3; i <= 7; i++) {
      document.getElementById(`guide${i}`).value = guideData[i] || "";
      document.getElementById(`hotel${i}`).value = hotelData[i] || "";
    }
    calculateTotals();
  } else {
    for (let i = 3; i <= 7; i++) {
      document.getElementById(`guide${i}`).value = "";
      document.getElementById(`hotel${i}`).value = "";
    }
    calculateTotals();
  }
}

window.saveGuideFees = async function () {
  const country = document.getElementById("countrySelect").value;
  const course = document.getElementById("courseSelect").value;
  const type = document.getElementById("tourType").value;

  const guideData = {};
  const hotelData = {};
  for (let i = 3; i <= 7; i++) {
    const g = parseFloat(document.getElementById(`guide${i}`).value);
    const h = parseFloat(document.getElementById(`hotel${i}`).value);
    if (!isNaN(g)) guideData[i] = g;
    if (!isNaN(h)) hotelData[i] = h;
  }

  const key = `${country}_${course}`;
  await setDoc(doc(db, "guideFees", key), {
    [type]: {
      guide: guideData,
      hotel: hotelData
    }
  }, { merge: true });

  alert("저장 완료!");
};

window.calculateTotals = function () {
  let guideTotal = 0;
  let hotelTotal = 0;

  for (let i = 3; i <= 7; i++) {
    const guideInput = document.getElementById(`guide${i}`);
    const hotelInput = document.getElementById(`hotel${i}`);

    const guideFee = parseFloat(guideInput?.value) || 0;
    const hotelFee = parseFloat(hotelInput?.value) || 0;

    const guideSum = guideFee * i;
    const hotelSum = hotelFee * i;

    document.getElementById(`guideSum${i}`).innerText = guideFee ? `${guideSum} USD` : "-";
    document.getElementById(`hotelSum${i}`).innerText = hotelFee ? `${hotelSum} USD` : "-";

    guideTotal += guideSum;
    hotelTotal += hotelSum;
  }

  document.getElementById("guideTotal").innerText = `${guideTotal.toLocaleString()} USD`;
  document.getElementById("hotelTotal").innerText = `${hotelTotal.toLocaleString()} USD`;
};
