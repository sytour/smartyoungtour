import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, addDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById('countrySelect');
const courseSelect = document.getElementById('courseSelect');
const addBtn = document.getElementById('addEntryFeeBtn');

async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const countries = new Set();
  snapshot.forEach(doc => {
    countries.add(doc.data().country);
  });

  countrySelect.innerHTML = [...countries].map(c => `<option value="${c}">${c}</option>`).join('');
  updateCourseSelect();
}

async function updateCourseSelect() {
  const selectedCountry = countrySelect.value;
  const snapshot = await getDocs(query(collection(db, "courses"), where("country", "==", selectedCountry)));

  courseSelect.innerHTML = "";
  snapshot.forEach(doc => {
    const { course } = doc.data();
    courseSelect.innerHTML += `<option value="${course}">${course}</option>`;
  });

  loadEntryFees();
}

async function loadEntryFees() {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const list = document.getElementById('entryFeeList');
  list.innerHTML = "";

  const snapshot = await getDocs(
    query(collection(db, "entry_fees"), where("country", "==", country), where("course", "==", course))
  );

  snapshot.forEach(doc => {
    const data = doc.data();
    list.innerHTML += `<li>${data.place} - ₩${data.fee.toLocaleString()}</li>`;
  });
}

addBtn.addEventListener("click", async () => {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const place = document.getElementById('placeInput').value.trim();
  const fee = parseInt(document.getElementById('feeInput').value);

  if (!place || isNaN(fee)) {
    alert("모든 항목을 올바르게 입력해주세요.");
    return;
  }

  await addDoc(collection(db, "entry_fees"), {
    country, course, place, fee
  });

  alert("입장료가 추가되었습니다.");
  document.getElementById('placeInput').value = "";
  document.getElementById('feeInput').value = "";
  loadEntryFees();
});

countrySelect.addEventListener("change", updateCourseSelect);
courseSelect.addEventListener("change", loadEntryFees);

loadCourses();
