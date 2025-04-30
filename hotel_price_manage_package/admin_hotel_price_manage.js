import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

let courseMap = new Map();

window.addEventListener('DOMContentLoaded', async () => {
  const countrySelect = document.getElementById("country");
  const courseSelect = document.getElementById("course");

  const snapshot = await getDocs(collection(db, "courses"));
  courseMap = new Map();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.country && data.course) {
      if (!courseMap.has(data.country)) {
        courseMap.set(data.country, new Set());
      }
      courseMap.get(data.country).add(data.course);
    }
  });

  countrySelect.innerHTML = "<option value=''>국가 선택</option>";
  [...courseMap.keys()].sort().forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });

  if (countrySelect.options.length > 1) {
    countrySelect.selectedIndex = 1;
    updateCourseOptions();
  }

  countrySelect.addEventListener("change", updateCourseOptions);

  function updateCourseOptions() {
    const selectedCountry = countrySelect.value;
    courseSelect.innerHTML = "<option value=''>코스 선택</option>";
    if (courseMap.has(selectedCountry)) {
      [...courseMap.get(selectedCountry)].sort().forEach(course => {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
      });
    }
  }
});
