import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById('countrySelect');
const courseSelect = document.getElementById('courseSelect');
const tableBody = document.getElementById('entryTableBody');

let allCourses = [];
let currentKey = '';
let currentEntries = [];

async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const countries = new Set();
  allCourses = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    countries.add(data.country);
    allCourses.push(data);
  });
  countrySelect.innerHTML = [...countries].sort().map(c => `<option value="${c}">${c}</option>`).join('');
  updateCourseSelect();
}

function updateCourseSelect() {
  const selectedCountry = countrySelect.value;
  const filtered = allCourses.filter(c => c.country === selectedCountry);
  courseSelect.innerHTML = filtered.map(c => `<option value="${c.course}">${c.course}</option>`).join('');
  loadEntries();
}

function getFirestoreKey() {
  const country = countrySelect.value;
  const course = courseSelect.value;
  return `${country}__${course}`;
}

async function loadEntries() {
  currentKey = getFirestoreKey();
  const ref = doc(db, "entry_fees", currentKey);
  const snap = await getDoc(ref);
  currentEntries = snap.exists() ? snap.data().entries || [] : [];
  renderEntries();
}

function renderEntries() {
  tableBody.innerHTML = '';
  let total = 0;
  currentEntries.forEach((item, idx) => total += item.fee);

  currentEntries.forEach((item, idx) => {
    const tr = document.createElement('tr');

    if (idx === 0) {
      const tdCourse = document.createElement('td');
      tdCourse.rowSpan = currentEntries.length + 2;
      tdCourse.textContent = currentKey.replace(/__/g, ' - ');
      tr.appendChild(tdCourse);
    }

    const tdPlace = document.createElement('td');
    tdPlace.textContent = item.place;
    const tdFee = document.createElement('td');
    tdFee.textContent = `$${item.fee.toLocaleString()}`;

    if (idx === 0) {
      const tdTotal = document.createElement('td');
      tdTotal.rowSpan = currentEntries.length + 2;
      tdTotal.textContent = `$${total.toLocaleString()}`;
      tr.appendChild(tdPlace);
      tr.appendChild(tdFee);
      tr.appendChild(tdTotal);
    } else {
      tr.appendChild(tdPlace);
      tr.appendChild(tdFee);
    }

    const tdEdit = document.createElement('td');
    tdEdit.innerHTML = `<button onclick="editEntry(${idx})">✏️</button>`;
    const tdDelete = document.createElement('td');
    tdDelete.innerHTML = `<button onclick="deleteEntry(${idx})">🗑️</button>`;

    tr.appendChild(tdEdit);
    tr.appendChild(tdDelete);
    tableBody.appendChild(tr);
  });

  const trInput = document.createElement('tr');
  trInput.innerHTML = `
    <td><input id="placeInput" placeholder="새 관광지 입력란" /></td>
    <td><input id="feeInput" type="number" placeholder="$ 입력칸" /></td>
    <td></td>
    <td colspan="2"><button onclick="addEntry()">관광지 추가</button></td>
  `;
  tableBody.appendChild(trInput);
}

window.addEntry = async function () {
  const place = document.getElementById("placeInput").value.trim();
  const fee = parseFloat(document.getElementById("feeInput").value);
  if (!place || isNaN(fee)) return alert("정확히 입력해주세요.");
  currentEntries.push({ place, fee });
  await saveEntries();
  document.getElementById("placeInput").value = "";
  document.getElementById("feeInput").value = "";
};

window.editEntry = function (idx) {
  const item = currentEntries[idx];
  const newPlace = prompt("관광지 이름", item.place);
  const newFee = parseFloat(prompt("입장료 ($)", item.fee));
  if (!newPlace || isNaN(newFee)) return;
  currentEntries[idx] = { place: newPlace, fee: newFee };
  saveEntries();
};

window.deleteEntry = function (idx) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  currentEntries.splice(idx, 1);
  saveEntries();
};

async function saveEntries() {
  const [country, course] = currentKey.split("__");
  await setDoc(doc(db, "entry_fees", currentKey), {
    country,
    course,
    entries: currentEntries
  });
  renderEntries();
}

countrySelect.addEventListener("change", updateCourseSelect);
courseSelect.addEventListener("change", loadEntries);

loadCourses();
