import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById("countrySelect");
const courseSelect = document.getElementById("courseSelect");
const addCourseBtn = document.getElementById("addCourseBtn");
const tableBody = document.querySelector("tbody");

let allCourses = [];
let addedCourses = {}; // { "라오스__루앙프라방 일반 3박": [ {place, fee} ] }

async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  allCourses = [];

  snapshot.forEach(doc => {
    allCourses.push(doc.data());
  });

  const countries = [...new Set(allCourses.map(c => c.country))];
  countrySelect.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join('');
  updateCourseSelect();
}

function updateCourseSelect() {
  const selectedCountry = countrySelect.value;
  const filtered = allCourses.filter(c => c.country === selectedCountry);
  courseSelect.innerHTML = filtered.map(c => `<option value="${c.course}">${c.course}</option>`).join('');
}

addCourseBtn.addEventListener("click", async () => {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const key = `${country}__${course}`;
  if (addedCourses[key]) return;

  const docRef = doc(db, "entry_fees", key);
  const docSnap = await getDoc(docRef);
  addedCourses[key] = docSnap.exists() ? docSnap.data().entries : [];
  renderTable();
});

function renderTable() {
  const sortedKeys = Object.keys(addedCourses).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  tableBody.innerHTML = "";

  sortedKeys.forEach(key => {
    const [country, course] = key.split("__");
    const entries = addedCourses[key];
    const total = entries.reduce((sum, item) => sum + item.fee, 0);

    entries.forEach((entry, idx) => {
      const tr = document.createElement("tr");

      if (idx === 0) {
        const tdCourse = document.createElement("td");
        tdCourse.rowSpan = entries.length + 1;
        tdCourse.textContent = `${country} - ${course}`;
        tr.appendChild(tdCourse);
      }

      const tdPlace = document.createElement("td");
      tdPlace.textContent = entry.place;

      const tdFee = document.createElement("td");
      tdFee.textContent = `$${entry.fee.toLocaleString()}`;

      if (idx === 0) {
        const tdTotal = document.createElement("td");
        tdTotal.rowSpan = entries.length + 1;
        tdTotal.textContent = `$${total.toLocaleString()}`;
        tr.appendChild(tdPlace);
        tr.appendChild(tdFee);
        tr.appendChild(tdTotal);
      } else {
        tr.appendChild(tdPlace);
        tr.appendChild(tdFee);
      }

      const tdEdit = document.createElement("td");
      const tdDelete = document.createElement("td");

      tdEdit.innerHTML = `<button onclick="editEntry('${key}', ${idx})">✏️</button>`;
      tdDelete.innerHTML = `<button onclick="deleteEntry('${key}', ${idx})">🗑️</button>`;

      tr.appendChild(tdEdit);
      tr.appendChild(tdDelete);

      tableBody.appendChild(tr);
    });

    // 새 입력 줄
    const trInput = document.createElement("tr");
    trInput.innerHTML = `
      <td><input id="place-${key}" placeholder="새 관광지 입력란" /></td>
      <td><input id="fee-${key}" type="number" placeholder="$ 입력칸" /></td>
      <td colspan="2"><button onclick="addEntry('${key}')">관광지 추가</button></td>
    `;
    tableBody.appendChild(trInput);
  });
}

window.addEntry = async function (key) {
  const place = document.getElementById(`place-${key}`).value.trim();
  const fee = parseFloat(document.getElementById(`fee-${key}`).value);

  if (!place || isNaN(fee)) {
    alert("관광지 이름과 금액을 정확히 입력해주세요.");
    return;
  }

  addedCourses[key].push({ place, fee });
  await saveEntries(key);
};

window.editEntry = function (key, index) {
  const entry = addedCourses[key][index];
  const newPlace = prompt("관광지 이름 수정", entry.place);
  const newFee = parseFloat(prompt("입장료 수정 ($)", entry.fee));

  if (!newPlace || isNaN(newFee)) return;

  addedCourses[key][index] = { place: newPlace, fee: newFee };
  saveEntries(key);
};

window.deleteEntry = function (key, index) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  addedCourses[key].splice(index, 1);
  saveEntries(key);
};

async function saveEntries(key) {
  const [country, course] = key.split("__");
  const docRef = doc(db, "entry_fees", key);
  await setDoc(docRef, {
    country,
    course,
    entries: addedCourses[key]
  });
  renderTable();
}

countrySelect.addEventListener("change", updateCourseSelect);
loadCourses();
