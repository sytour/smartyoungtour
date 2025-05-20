// admin_guide_fee_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

window.onload = async function () {
  const snapshot = await getDocs(collection(db, 'courses'));
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");

  const countries = new Set();
  const courseMap = {};

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
  };

  countrySelect.dispatchEvent(new Event("change"));
};

window.saveGuideFees = async function () {
  const country = document.getElementById("countrySelect").value;
  const course = document.getElementById("courseSelect").value;
  const type = document.getElementById("tourType").value;

  const feeData = {};
  for (let i = 3; i <= 7; i++) {
    const val = parseFloat(document.getElementById(`nights${i}`).value);
    if (!isNaN(val)) {
      feeData[i] = val;
    }
  }

  const key = `${country}_${course}`;
  await setDoc(doc(db, "guideFees", key), {
    [type]: feeData
  }, { merge: true });

  alert("저장 완료!");
};
