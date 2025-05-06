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
let editingId = null;

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

    const data = { country, course, minPeople, maxPeople, van, minibus, bus };

    try {
      if (editingId) {
        await updateDoc(doc(db, "vehicle_prices", editingId), data);
        alert("수정 완료");
        editingId = null;
      } else {
        await addDoc(collection(db, "vehicle_prices"), data);
        alert("등록 완료");
      }
      resetForm();
      await renderTable();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 실패");
    }
  });

  await renderTable();
});

function resetForm() {
  document.getElementById("country").value = "";
  document.getElementById("course").innerHTML = "<option value=''>코스 선택</option>";
  document.getElementById("minPeople").value = "";
  document.getElementById("maxPeople").value = "";
  document.getElementById("van").value = "";
  document.getElementById("minibus").value = "";
  document.getElementById("bus").value = "";
  editingId = null;
}

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

  dataList.sort((a, b) => {
    const aKey = `${a.country}${a.course}${a.minPeople}`;
    const bKey = `${b.country}${b.course}${b.minPeople}`;
    return aKey.localeCompare(bKey, 'ko');
  });

  dataList.forEach(data => {
    const total = (data.van || 0) + (data.minibus || 0) + (data.bus || 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.country}</td>
      <td>${data.course}</td>
      <td>${data.minPeople}~${data.maxPeople}명</td>
      <td>${data.van || 0}</td>
      <td>${data.minibus || 0}</td>
      <td>${data.bus || 0}</td>
      <td>$${total}</td>
      <td>
        <button onclick="editVehicle('${data.id}')">수정</button>
        <button onclick="deleteVehicle('${data.id}')">삭제</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.deleteVehicle = async function (id) {
  if (confirm("삭제하시겠습니까?")) {
    await deleteDoc(doc(db, "vehicle_prices", id));
    alert("삭제 완료");
    await renderTable();
  }
};

window.editVehicle = async function (id) {
  const snapshot = await getDocs(collection(db, "vehicle_prices"));
  snapshot.forEach(docSnap => {
    if (docSnap.id === id) {
      const data = docSnap.data();
      document.getElementById("country").value = data.country;

      const courseSelect = document.getElementById("course");
      courseSelect.innerHTML = `<option>${data.course}</option>`;
      document.getElementById("minPeople").value = data.minPeople;
      document.getElementById("maxPeople").value = data.maxPeople;
      document.getElementById("van").value = data.van || 0;
      document.getElementById("minibus").value = data.minibus || 0;
      document.getElementById("bus").value = data.bus || 0;
      editingId = id;
    }
  });
};
