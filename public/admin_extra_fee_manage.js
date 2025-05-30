import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, setDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ 본인의 Firebase 설정으로 교체 필요
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
const tax = document.getElementById("tax");
const handling = document.getElementById("handling");
const reserve = document.getElementById("reserve");
const etc = document.getElementById("etc");
const total = document.getElementById("total");
const dataBody = document.getElementById("dataBody");
const filterCountry = document.getElementById("filterCountry");

let allData = [];

// ✅ 합계 자동 계산
[tax, handling, reserve, etc].forEach(input => {
  input.addEventListener("input", () => {
    total.value = (
      Number(tax.value) +
      Number(handling.value) +
      Number(reserve.value) +
      Number(etc.value)
    ).toFixed(2);
  });
});

// ✅ 국가/코스 불러오기
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

// ✅ 저장
window.saveData = async () => {
  const data = {
    country: countrySelect.value,
    course: courseSelect.value,
    tax: Number(tax.value),
    handling: Number(handling.value),
    reserve: Number(reserve.value),
    etc: Number(etc.value),
    total: Number(total.value)
  };
  const id = `${data.country}_${data.course}`;
  await setDoc(doc(db, "extra_fees", id), data);
  loadSavedData();
};

// ✅ 저장된 목록 불러오기
async function loadSavedData() {
  const snapshot = await getDocs(collection(db, "extra_fees"));
  allData = [];
  snapshot.forEach(doc => {
    allData.push(doc.data());
  });
  renderDataTable(allData);
}

// ✅ 테이블 렌더링
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
      <td><input type="number" value="${d.tax}" data-field="tax" data-id="${d.country}_${d.course}"></td>
      <td><input type="number" value="${d.handling}" data-field="handling" data-id="${d.country}_${d.course}"></td>
      <td><input type="number" value="${d.reserve}" data-field="reserve" data-id="${d.country}_${d.course}"></td>
      <td><input type="number" value="${d.etc}" data-field="etc" data-id="${d.country}_${d.course}"></td>
      <td>${d.total.toFixed(2)}</td>
      <td><button class="btn-small" onclick="updateData('${d.country}', '${d.course}')">수정</button></td>
      <td><button class="btn-small" onclick="deleteData('${d.country}', '${d.course}')">삭제</button></td>
    </tr>
  `).join("");
}

// ✅ 국가 필터링
window.filterByCountry = () => {
  renderDataTable(allData);
};

// ✅ 수정
window.updateData = async (country, course) => {
  const id = `${country}_${course}`;
  const rowInputs = document.querySelectorAll(`input[data-id="${id}"]`);
  let newData = { country, course };
  let total = 0;

  rowInputs.forEach(input => {
    const value = Number(input.value);
    newData[input.dataset.field] = value;
    total += value;
  });

  newData.total = total;
  await setDoc(doc(db, "extra_fees", id), newData);
  loadSavedData();
};

// ✅ 삭제
window.deleteData = async (country, course) => {
  await deleteDoc(doc(db, "extra_fees", `${country}_${course}`));
  loadSavedData();
};

// ✅ 초기 로딩
loadCourses();
loadSavedData();
