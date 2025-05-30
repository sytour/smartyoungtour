// admin_extra_fee_manage.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, setDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Firebase 설정 (자신의 Firebase 정보로 바꿔주세요)
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

// 요소 참조
const countrySelect = document.getElementById("countrySelect");
const courseSelect = document.getElementById("courseSelect");
const tax = document.getElementById("tax");
const handling = document.getElementById("handling");
const reserve = document.getElementById("reserve");
const etc = document.getElementById("etc");
const total = document.getElementById("total");
const dataBody = document.getElementById("dataBody");
const filterCountry = document.getElementById("filterCountry");

let allData = []; // 전체 데이터 저장용

// 실시간 합계 계산
[tax, handling, reserve, etc].forEach(input => {
  input.addEventListener("input", () => {
    total.innerText = (
      Number(tax.value) +
      Number(handling.value) +
      Number(reserve.value) +
      Number(etc.value)
    ).toFixed(2);
  });
});

// 코스 불러오기
async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const courseList = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    courseList.push({ country: data.country, course: data.course });
  });

  const countries = [...new Set(courseList.map(c => c.country))].sort();
  countrySelect.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join("");
  filterCountry.innerHTML += countries.map(c => `<option value="${c}">${c}</option>`).join("");

  updateCourseSelect();

  countrySelect.addEventListener("change", updateCourseSelect);

  function updateCourseSelect() {
    const selected = countrySelect.value;
    const filtered = courseList.filter(c => c.country === selected);
    courseSelect.innerHTML = filtered.map(c => `<option value="${c.course}">${c.course}</option>`).join("");
  }
}

// 저장
window.saveData = async () => {
  const data = {
    country: countrySelect.value,
    course: courseSelect.value,
    tax: Number(tax.value),
    handling: Number(handling.value),
    reserve: Number(reserve.value),
    etc: Number(etc.value),
    total: Number(total.innerText)
  };
  const id = `${data.country}_${data.course}`;
  await setDoc(doc(db, "extra_fees", id), data);
  loadSavedData();
};

// 불러오기
async function loadSavedData() {
  const snapshot = await getDocs(collection(db, "extra_fees"));
  allData = [];
  snapshot.forEach(doc => {
    allData.push(doc.data());
  });
  renderDataTable(allData);
}

// 테이블 렌더링
function renderDataTable(dataArray) {
  const selectedCountry = filterCountry.value;
  const filtered = selectedCountry === "전체"
    ? dataArray
    : dataArray.filter(d => d.country === selectedCountry);

  filtered.sort((a, b) => a.country.localeCompare(b.country));
  dataBody.innerHTML = filtered.map(d => `
    <tr>
      <td>${d.country}</td>
      <td>${d.course}</td>
      <td><input ty
