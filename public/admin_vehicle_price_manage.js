import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
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

window.addEventListener("DOMContentLoaded", async () => {
  const countrySelect = document.getElementById("country");
  const courseSelect = document.getElementById("course");
  const addBtn = document.getElementById("addBtn");
  const filterSelect = document.getElementById("countryFilter");

  const courseSnap = await getDocs(collection(db, "courses"));
  courseMap = new Map();

  courseSnap.forEach(doc => {
    const data = doc.data();
    if (data.country && data.course) {
      if (!courseMap.has(data.country)) courseMap.set(data.country, new Set());
      courseMap.get(data.country).add(data.course);
    }
  });

  const countries = [...courseMap.keys()].sort((a, b) => a.localeCompare(b, 'ko'));
  countries.forEach(country => {
    const opt1 = document.createElement("option");
    const opt2 = document.createElement("option");
    opt1.value = country;
    opt1.textContent = country;
    opt2.value = country;
    opt2.textContent = country;
    countrySelect.appendChild(opt1);
    filterSelect.appendChild(opt2);
  });

  countrySelect.addEventListener("change", () => {
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
  });

  filterSelect.addEventListener("change", renderTable);

  addBtn.addEventListener("click", async () => {
    const country = countrySelect.value;
    const course = courseSelect.value;
    const minPeople = parseInt(document.getElementById("minPeople").value);
    const maxPeople = parseInt(document.getElementById("maxPeople").value);
    const van = parseFloat(document.getElementById("van").value) || 0;
    const minibus = parseFloat(document.getElementById("minibus").value) || 0;
    const bus = parseFloat(document.getElementById("bus").value) || 0;

    if (!country || !course || isNaN(minPeople) || isNaN(maxPeople)) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "vehicle_prices"), {
      country,
      course,
      minPeople,
      maxPeople,
      van,
      minibus,
      bus
    });

    alert("등록 완료");
    await renderTable();
  });

  await renderTable();
});

async function renderTable() {
  const tableBody = document.getElementById("vehicleTable");
  tableBody.innerHTML = "";

  const filter = document.getElementById("countryFilter").value;
  const snapshot = await getDocs(collection(db, "vehicle_prices"));
  const dataList = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    data.id = docSnap.id;
    if (!filter || data.country === filter) {
      dataList.push(data);
    }
  });

  // ✅ 정렬: 국가 → 코스 → 인원 오름차순
  dataList.sort((a, b) => {
    const c1 = a.country.localeCompare(b.country, 'ko');
    if (c1 !== 0) return c1;

    const c2 = a.course.localeCompare(b.course, 'ko');
    if (c2 !== 0) return c2;

    return a.minPeople - b.minPeople;
  });

  dataList.forEach(data => {
    const total = (data.van || 0) + (data.minibus || 0) + (data.bus || 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.country}</td>
      <td>${data.course}</td>
      <td>
        <input type="number" id="min_${data.id}" value="${data.minPeople}" style="width:50px"/> ~
        <input type="number" id="max_${data.id}" value="${data.maxPeople}" style="width:50px"/>
      </td>
      <td><input type="number" id="van_${data.id}" value="${data.van}" style="width:60px"/></td>
      <td><input type="number" id="minibus_${data.id}" value="${data.minibus}" style="width:60px"/></td>
      <td><input type="number" id="bus_${data.id}" value="${data.bus}" style="width:60px"/></td>
      <td>$${total}</td>
      <td class="control-buttons">
        <button onclick="window.saveVehicle('${data.id}', '${data.country}', '${data.course}')">저장</button>
        <button onclick="window.deleteVehicle('${data.id}')">삭제</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.saveVehicle = async function (id, country, course) {
  const minPeople = parseInt(document.getElementById(`min_${id}`).value);
  const maxPeople = parseInt(document.getElementById(`max_${id}`).value);
  const van = parseFloat(document.getElementById(`van_${id}`).value);
  const minibus = parseFloat(document.getElementById(`minibus_${id}`).value);
  const bus = parseFloat(document.getElementById(`bus_${id}`).value);

  await updateDoc(doc(db, "vehicle_prices", id), {
    country,
    course,
    minPeople,
    maxPeople,
    van,
    minibus,
    bus
  });

  alert("수정 완료");
  await renderTable();
};

window.deleteVehicle = async function (id) {
  if (confirm("삭제하시겠습니까?")) {
    await deleteDoc(doc(db, "vehicle_prices", id));
    alert("삭제 완료");
    await renderTable();
  }
};
