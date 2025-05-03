// admin_hotel_price_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  addBtn.addEventListener("click", addHotelPrice);

  await renderTable();

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
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "hotel_prices"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = `
      <tr>
        <td>${data.country}</td>
        <td>${data.course}</td>
        <td>${data.grade}</td>
        <td>${data.single}</td>
        <td>${data.twin_double}</td>
        <td>${data.triple}</td>
        <td><button onclick="deleteHotel('${docSnap.id}')">삭제</button></td>
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
