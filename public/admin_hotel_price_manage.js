import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  const addBtn = document.getElementById("addBtn");
  const filterSelect = document.getElementById("countryFilter");

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

  // Populate country dropdowns (등록용 + 필터용)
  const sortedCountries = [...courseMap.keys()].sort((a, b) => a.localeCompare(b, 'ko'));
  sortedCountries.forEach(country => {
    const option1 = document.createElement("option");
    option1.value = country;
    option1.textContent = country;
    countrySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = country;
    option2.textContent = country;
    filterSelect.appendChild(option2);
  });

  // 기본 선택: 첫 국가에 대한 코스 보여주기
  if (countrySelect.options.length > 1) {
    countrySelect.selectedIndex = 1;
    updateCourseOptions();
  }

  countrySelect.addEventListener("change", updateCourseOptions);
  filterSelect.addEventListener("change", renderTable);
  addBtn.addEventListener("click", addHotelPrice);

  await renderTable();

  function updateCourseOptions() {
    const selectedCountry = countrySelect.value;
    courseSelect.innerHTML = "<option value=''>코스 선택</option>";
    if (courseMap.has(selectedCountry)) {
      [...courseMap.get(selectedCountry)].sort((a, b) => a.localeCompare(b, 'ko')).forEach(course => {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
      });
    }
  }
});

async function addHotelPrice() {
  const country = document.getElementById("country").value;
  const course = document.getElementById("course").value;
  const grade = document.getElementById("grade").value;
  const single = parseFloat(document.getElementById("single").value);
  const twin_double = parseFloat(document.getElementById("twin_double").value);
  const triple = parseFloat(document.getElementById("triple").value);

  if (!country || !course || !grade) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  await addDoc(collection(db, "hotel_prices"), {
    country,
    course,
    grade,
    single,
    twin_double,
    triple
  });

  alert("추가 완료");
  await renderTable();
}

async function renderTable() {
  const tableBody = document.querySelector("#hotelTable tbody");
  const filter = document.getElementById("countryFilter").value;
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "hotel_prices"));
  const dataList = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    data.id = docSnap.id;
    if (!filter || data.country === filter) {
      dataList.push(data);
    }
  });

  // 정렬: 국가 > 코스
  dataList.sort((a, b) => {
    const aKey = `${a.country}${a.course}`;
    const bKey = `${b.country}${b.course}`;
    return aKey.localeCompare(bKey, 'ko');
  });

  dataList.forEach(data => {
    const row = `
      <tr>
        <td>${data.country}</td>
        <td>${data.course}</td>
        <td>${data.grade}</td>
        <td>${data.single}</td>
        <td>${data.twin_double}</td>
        <td>${data.triple}</td>
        <td><button onclick="deleteHotel('${data.id}')">삭제</button></td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

window.deleteHotel = async function (id) {
  if (confirm("정말 삭제하시겠습니까?")) {
    await deleteDoc(doc(db, "hotel_prices", id));
    alert("삭제 완료");
    await renderTable();
  }
};
