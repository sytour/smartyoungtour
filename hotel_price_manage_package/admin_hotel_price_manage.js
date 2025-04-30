// admin_hotel_price_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhTfLaqtqR1Bva_pIbskWl5Ah0CE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.firebasestorage.app",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
  measurementId: "G-KN3EQNZWLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allCourses = [];

window.addEventListener("DOMContentLoaded", async () => {
  const countrySelect = document.getElementById("country");
  const courseSelect = document.getElementById("course");

  const snapshot = await getDocs(collection(db, "courses"));
  const countryMap = new Map(); // country -> Set of course

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.country && data.course) {
      if (!countryMap.has(data.country)) {
        countryMap.set(data.country, new Set());
      }
      countryMap.get(data.country).add(data.course);
    }
  });

  // 국가 목록 정렬 후 삽입
  countrySelect.innerHTML = "<option value=''>국가 선택</option>";
  [...countryMap.keys()].sort().forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });

  // 최초 국가 자동 선택 (있을 경우)
  if (countrySelect.options.length > 1) {
    countrySelect.selectedIndex = 1;
    updateCourseOptions();
  }

  // 국가 변경 시 코스 업데이트
  countrySelect.addEventListener("change", updateCourseOptions);

  function updateCourseOptions() {
    const selectedCountry = countrySelect.value;
    courseSelect.innerHTML = "<option value=''>코스 선택</option>";
    if (countryMap.has(selectedCountry)) {
      [...countryMap.get(selectedCountry)].forEach(course => {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
      });
    }
  }
});
