import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, doc, setDoc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById("countrySelect");
const courseSelect = document.getElementById("courseSelect");
const addCourseBtn = document.getElementById("addCourseBtn");
const courseList = document.getElementById("courseList");

const placeInput = document.getElementById("placeInput");
const feeInput = document.getElementById("feeInput");
const addEntryFeeBtn = document.getElementById("addEntryFeeBtn");
const entryFeeList = document.getElementById("entryFeeList");
const selectedCourseTitle = document.getElementById("selectedCourseTitle");
const totalFeeDiv = document.getElementById("totalFee");

let allCourses = [];
let selectedCourseKey = null;
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

  countrySelect.innerHTML = [...countries]
    .map(c => `<option value="${c}">${c}</option>`)
    .join("");
  updateCourseSelect();
}

function updateCourseSelect() {
  const selectedCountry = countrySelect.value;
  const filtered = allCourses.filter(c => c.country === selectedCountry);
  courseSelect.innerHTML = filtered
    .map(c => `<option value="${c.course}">${c.course}</option>`)
    .join("");
}

addCourseBtn.addEventListener("click", () => {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const key = `${country}__${course}`;

  if ([...courseList.children].some(li => li.dataset.key === key)) {
    alert("이미 추가된 코스입니다.");
    return;
  }

  const li = document.createElement("li");
  li.innerText = `${country} - ${course}`;
  li.dataset.key = key;
  li.addEventListener("click", () => selectCourse(country, course));
  courseList.appendChild(li);
  selectCourse(country, course);
});

async function selectCourse(country, course) {
  selectedCourseKey = `${country}__${course}`;
  selectedCourseTitle.innerText = `선택된 코스: ${country} - ${course}`;
  const docRef = doc(db, "entry_fees", selectedCourseKey);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    currentEntries = docSnap.data().entries || [];
  } else {
    currentEntries = [];
  }

  renderEntries();
}

addEntryFeeBtn.addEventListener("click", async () => {
  const place = placeInput.value.trim();
  const fee = parseInt(feeInput.value);

  if (!place || isNaN(fee)) {
    alert("관광지 이름과 입장료를 정확히 입력해주세요.");
    return;
  }

  currentEntries.push({ place, fee });
  await saveEntries();
  placeInput.value = "";
  feeInput.value = "";
});

async function saveEntries() {
  if (!selectedCourseKey) return;

  const [country, course] = selectedCourseKey.split("__");
  const docRef = doc(db, "entry_fees", selectedCourseKey);
  await setDoc(docRef, {
    country,
    course,
    entries: currentEntries
  });

  renderEntries();
}

function renderEntries() {
  entryFeeList.innerHTML = "";
  let total = 0;

  currentEntries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${entry.place} - ₩${entry.fee.toLocaleString()}</span>
      <div>
        <button onclick="editEntry(${index})">✏️</button>
        <button onclick="deleteEntry(${index})">🗑️</button>
      </div>
    `;
    entryFeeList.appendChild(li);
    total += entry.fee;
  });

  totalFeeDiv.innerText = `총 합계: ₩${total.toLocaleString()}`;
}

window.editEntry = (index) => {
  const entry = currentEntries[index];
  const newPlace = prompt("관광지 이름 수정:", entry.place);
  const newFee = prompt("입장료 수정 (숫자):", entry.fee);

  if (!newPlace || isNaN(parseInt(newFee))) return;

  currentEntries[index] = {
    place: newPlace,
    fee: parseInt(newFee)
  };
  saveEntries();
};

window.deleteEntry = (index) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  currentEntries.splice(index, 1);
  saveEntries();
};

countrySelect.addEventListener("change", updateCourseSelect);

loadCourses();
