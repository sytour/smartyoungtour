// admin_guide_cost_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

let courses = [];

window.onload = async function () {
  await renderAllSavedGuideCosts();
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");
  const filterSelect = document.getElementById("filterCountry");
  const snapshot = await getDocs(collection(db, 'courses'));
  const countryMap = {};

  // ✅ 전체 보기 항목 먼저 추가
  const optDefault = document.createElement("option");
  optDefault.value = "";
  optDefault.textContent = "전체";
  filterSelect.appendChild(optDefault);

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!countryMap[data.country]) countryMap[data.country] = [];
    countryMap[data.country].push(data.course);
  });

  Object.keys(countryMap).sort().forEach(country => {
    const opt1 = document.createElement("option");
    opt1.value = country;
    opt1.textContent = country;
    countrySelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = country;
    opt2.textContent = country;
    filterSelect.appendChild(opt2);
  });

  countrySelect.onchange = () => {
    const selected = countrySelect.value;
    courseSelect.innerHTML = "";
    (countryMap[selected] || []).sort().forEach(course => {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      courseSelect.appendChild(opt);
    });
  };

  countrySelect.dispatchEvent(new Event("change"));
};

// (이하 나머지 코드 동일)

// 👇 아래 나머지 코드는 기존과 동일하게 유지됩니다
// window.addGuideCostRows = ...
// window.updateTotal = ...
// window.saveGuideCost = ...
// window.deleteGuideCost = ...
// window.filterSavedByCountry = ...
// window.renderAllSavedGuideCosts = ...
// window.saveEdited = ...
