// admin_meal_price_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  const daysSelect = document.getElementById("days");
  const mealInputs = document.getElementById("mealInputs");
  const addBtn = document.getElementById("addBtn");
  const firstDinner = document.getElementById("firstDinner");
  const countryFilter = document.getElementById("countryFilter");

  const snapshot = await getDocs(collection(db, "courses"));
  const countryMap = new Map();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.country && data.course) {
      if (!countryMap.has(data.country)) countryMap.set(data.country, new Set());
      countryMap.get(data.country).add(data.course);
    }
  });

  countrySelect.innerHTML = "<option value=''>국가 선택</option>";
  countryFilter.innerHTML = "<option value=''>전체 보기</option>";
  [...countryMap.keys()].sort().forEach(country => {
    const option1 = document.createElement("option");
    option1.value = country;
    option1.textContent = country;
    countrySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = country;
    option2.textContent = country;
    countryFilter.appendChild(option2);
  });

  countrySelect.addEventListener("change", () => {
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
  });

  countryFilter.addEventListener("change", renderTable);

  daysSelect.addEventListener("change", generateMealInputs);
  generateMealInputs();

  async function generateMealInputs() {
    const days = parseInt(daysSelect.value);
    mealInputs.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i}일차</td>
        <td><input type="number" id="lunch${i}" placeholder="0"></td>
        <td><input type="number" id="dinner${i}" placeholder="0"></td>
      `;
      mealInputs.appendChild(row);
    }
  }

  addBtn.addEventListener("click", async () => {
    const country = countrySelect.value;
    const days = parseInt(daysSelect.value);
    const course = `${courseSelect.value} ${days}박`; // ✅ 박 포함 코스명
    const includeFirstDinner = firstDinner.checked;

    if (!country || !course) {
      alert("국가 및 코스를 선택해주세요.");
      return;
    }

    let totalLunch = 0;
    let totalDinner = 0;
    let firstDinnerValue = 0;

    for (let i = 1; i <= 6; i++) {
      const lunchVal = parseFloat(document.getElementById(`lunch${i}`).value) || 0;
      const dinnerVal = parseFloat(document.getElementById(`dinner${i}`).value) || 0;
      if (i === 1) {
        firstDinnerValue = dinnerVal;
      } else {
        totalLunch += lunchVal;
        totalDinner += dinnerVal;
      }
    }

    try {
      await addDoc(collection(db, "meal_prices"), {
        country,
        course,
        days,
        totalLunch,
        totalDinner,
        includeFirstDinner,
        firstDinnerValue
      });
      alert("등록 완료");
      renderTable();
    } catch (e) {
      console.error("추가 실패", e);
      alert("등록 실패");
    }
  });

  renderTable();

  async function renderTable() {
    const tbody = document.querySelector("#mealTable tbody");
    tbody.innerHTML = "";
    const selectedCountry = countryFilter.value;
    const snapshot = await getDocs(collection(db, "meal_prices"));

    // ✅ 정렬 추가: 국가 > 코스 순으로 가나다 정렬
    const sortedDocs = snapshot.docs.sort((a, b) => {
      const aData = a.data();
      const bData = b.data();
      if (aData.country !== bData.country) {
        return aData.country.localeCompare(bData.country, 'ko');
      }
      return aData.course.localeCompare(bData.course, 'ko');
    });

    sortedDocs.forEach(docSnap => {
      const data = docSnap.data();
      if (!selectedCountry || data.country === selectedCountry) {
        const totalAll = (data.totalLunch || 0) + (data.totalDinner || 0) + (data.includeFirstDinner ? (data.firstDinnerValue || 0) : 0);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.country}</td>
          <td>${data.course}</td>
          <td>${data.days}박</td>
          <td>${data.includeFirstDinner ? "포함" : ""}</td>
          <td>$${data.totalLunch}</td>
          <td>$${data.totalDinner}</td>
          <td>$${totalAll}</td>
          <td><button onclick="deleteMeal('${docSnap.id}')">삭제</button></td>
        `;
        tbody.appendChild(row);
      }
    });
  }

  window.deleteMeal = async function(id) {
    if (confirm("삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "meal_prices", id));
      alert("삭제 완료");
      renderTable();
    }
  }
});
