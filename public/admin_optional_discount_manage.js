import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔧 Firebase 설정값 채워주세요
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById("countrySelect");
const courseSelect = document.getElementById("courseSelect");

let courseDataMap = {};

function updateCountryDropdown() {
  countrySelect.innerHTML = '<option value="">선택</option>';
  Object.keys(courseDataMap).sort().forEach(country => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });
}

function updateCourseDropdown() {
  const selectedCountry = countrySelect.value;
  const courseList = courseDataMap[selectedCountry] || [];
  courseSelect.innerHTML = '<option value="">선택</option>';
  courseList.forEach(course => {
    const opt = document.createElement("option");
    opt.value = course;
    opt.textContent = course;
    courseSelect.appendChild(opt);
  });
}

function subscribeToCourseUpdates() {
  onSnapshot(collection(db, "courses"), snapshot => {
    courseDataMap = {};
    snapshot.forEach(doc => {
      const { country, course } = doc.data();
      if (!courseDataMap[country]) courseDataMap[country] = [];
      if (!courseDataMap[country].includes(course)) {
        courseDataMap[country].push(course);
      }
    });
    updateCountryDropdown();
    updateCourseDropdown();
  });
}

countrySelect.addEventListener("change", updateCourseDropdown);

window.updatePreview = () => {
  const d1 = parseFloat(document.getElementById("discountGroup1").value) || 0;
  const d2 = parseFloat(document.getElementById("discountGroup2").value) || 0;
  document.getElementById("previewTotal").innerText = `${d1 + d2} USD`;
};

window.saveDiscount = async () => {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const option = document.getElementById("optionSelect").value;
  const shopping = document.getElementById("shoppingSelect").value;
  const d1 = parseFloat(document.getElementById("discountGroup1").value) || 0;
  const d2 = parseFloat(document.getElementById("discountGroup2").value) || 0;

  if (!country || !course) {
    alert("국가와 코스를 모두 선택하세요.");
    return;
  }

  const key = `${country}_${course}_${option}_${shopping}`;

  await setDoc(doc(db, "optional_discounts", key), {
    country,
    course,
    option,
    shopping,
    discount_1to7: d1,
    discount_8plus: d2,
    total: d1 + d2
  });

  alert("저장되었습니다.");
};

subscribeToCourseUpdates();
