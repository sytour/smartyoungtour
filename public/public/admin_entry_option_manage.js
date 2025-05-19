import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById('countrySelect');
const courseSelect = document.getElementById('courseSelect');
const optionSelect = document.getElementById('optionSelect');
const addBtn = document.getElementById('addEntryBtn');
const entryList = document.getElementById('entryList');
const entryTitle = document.getElementById('entryTitle');
const entryTotal = document.getElementById('entryTotal');

let allCourses = [];
let currentKey = '';
let currentEntries = [];

// 초기 코스 불러오기
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
  const option = optionSelect.value;
  return `${country}__${course}__${option}`;
}

async function loadEntries() {
  currentKey = getFirestoreKey();
  const ref = doc(db, "entry_fees", currentKey);
  const snap = await getDoc(ref);
  currentEntries = snap.exists() ? snap.data().entries || [] : [];
  renderEntries();
}

function renderEntries() {
  entryList.innerHTML = '';
  let total = 0;
  currentEntries.forEach((item, idx) => {
    const li = document.createElement('li');
    const feeFormatted = `$${item.fee.toLocaleString()}`;
    li.innerHTML = `
      <span>${item.place} - ${feeFormatted}</span>
      <span>
        <button onclick="editEntry(${idx})">✏️</button>
        <button onclick="deleteEntry(${idx})">🗑️</button>
      </span>
    `;
    total += item.fee;
    entryList.appendChild(li);
  });
  entryTotal.innerText = `합계: $${total.toLocaleString()}`;
}

window.editEntry = function(index) {
  const item = currentEntries[index];
  const newPlace = prompt("관광지 이름", item.place);
  const newFee = parseFloat(prompt("입장료 ($)", item.fee));
  if (!newPlace || isNaN(newFee)) return;
  currentEntries[index] = { place: newPlace, fee: newFee };
  saveEntries();
};

window.deleteEntry = function(index) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  currentEntries.splice(index, 1);
  saveEntries();
};

async function saveEntries() {
  const [country, course, option] = currentKey.split("__");
  await setDoc(doc(db, "entry_fees", currentKey), {
    country,
    course,
    option,
    entries: currentEntries
  });
  renderEntries();
}

addBtn.addEventListener("click", async () => {
  const place = document.getElementById("placeInput").value.trim();
  const fee = parseFloat(document.getElementById("feeInput").value);
  if (!place || isNaN(fee)) return alert("정확히 입력해주세요.");
  currentEntries.push({ place, fee });
  await saveEntries();
  document.getElementById("placeInput").value = "";
  document.getElementById("feeInput").value = "";
});

countrySelect.addEventListener("change", () => {
  updateCourseSelect();
});
courseSelect.addEventListener("change", loadEntries);
optionSelect.addEventListener("change", loadEntries);

loadCourses();
