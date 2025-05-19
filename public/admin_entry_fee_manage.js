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

const addCourseBtn = document.createElement("button");
addCourseBtn.textContent = "코스 추가";
addCourseBtn.style.marginLeft = "10px";
courseSelect.after(addCourseBtn);

let allCourses = [];
let courseEntriesMap = {};

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
}

addCourseBtn.addEventListener("click", async () => {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const key = `${country}__${course}`;
  if (courseEntriesMap[key]) return; // 이미 추가된 코스는 무시

  const ref = doc(db, "entry_fees", key);
  const snap = await getDoc(ref);
  courseEntriesMap[key] = snap.exists() ? snap.data().entries || [] : [];
  renderAllCourses();
});

function renderAllCourses() {
  tableBody.innerHTML = '';

  const sortedKeys = Object.keys(courseEntriesMap).sort((a, b) => a.localeCompare(b, 'ko-KR'));

  sortedKeys.forEach(key => {
    const entries = courseEntriesMap[key];
    const total = entries.reduce((sum, item) => sum + item.fee, 0);

    entries.forEach((entry, idx) => {
      const tr = document.createElement('tr');

      if (idx === 0) {
        const tdCourse = document.createElement('td');
        tdCourse.rowSpan = entries.length + 2;
        tdCourse.textContent = key.replace(/__/g, ' - ');
        tr.appendChild(tdCourse);
      }

      const tdPlace = document.createElement('td');
      tdPlace.textContent = entry.place;
      const tdFee = document.createElement('td');
      tdFee.textContent = `$${entry.fee.toLocaleString()}`;

      if (idx === 0) {
        const tdTotal = document.createElement('td');
        tdTotal.rowSpan = entries.length + 2;
        tdTotal.textContent = `$${total.toLocaleString()}`;
        tr.appendChild(tdPlace);
        tr.appendChild(tdFee);
        tr.appendChild(tdTotal);
      } else {
        tr.appendChild(tdPlace);
        tr.appendChild(tdFee);
      }

      const tdEdit = document.createElement('td');
      tdEdit.innerHTML = `<button onclick="editEntry('${key}', ${idx})">✏️</button>`;
      const tdDelete = document.createElement('td');
      tdDelete.innerHTML = `<button onclick="deleteEntry('${key}', ${idx})">🗑️</button>`;

      tr.appendChild(tdEdit);
      tr.appendChild(tdDelete);
      tableBody.appendChild(tr);
    });

    const trInput = document.createElement('tr');
    trInput.innerHTML = `
      <td><input id="place-${key}" placeholder="새 관광지 입력란" /></td>
      <td><input id="fee-${key}" type="number" placeholder="$ 입력칸" /></td>
      <td></td>
      <td colspan="2"><button onclick="addEntry('${key}')">관광지 추가</button></td>
    `;
    tableBody.appendChild(trInput);
  });
}

window.addEntry = async function (key) {
  const place = document.getElementById(`place-${key}`).value.trim();
  const fee = parseFloat(document.getElementById(`fee-${key}`).value);
  if (!place || isNaN(fee)) return alert("정확히 입력해주세요.");
  courseEntriesMap[key].push({ place, fee });
  await saveEntries(key);
};

window.editEntry = function (key, idx) {
  const item = courseEntriesMap[key][idx];
  const newPlace = prompt("관광지 이름", item.place);
  const newFee = parseFloat(prompt("입장료 ($)", item.fee));
  if (!newPlace || isNaN(newFee)) return;
  courseEntriesMap[key][idx] = { place: newPlace, fee: newFee };
  saveEntries(key);
};

window.deleteEntry = function (key, idx) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  courseEntriesMap[key].splice(idx, 1);
  saveEntries(key);
};

async function saveEntries(key) {
  const [country, course] = key.split("__");
  await setDoc(doc(db, "entry_fees", key), {
    country,
    course,
    entries: courseEntriesMap[key]
  });
  renderAllCourses();
}

countrySelect.addEventListener("change", updateCourseSelect);
loadCourses();
