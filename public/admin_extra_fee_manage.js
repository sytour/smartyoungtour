// admin_extra_fee_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, setDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
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

[tax, handling, reserve, etc].forEach(input => {
  input.addEventListener("input", () => {
    total.value = Number(tax.value) + Number(handling.value) + Number(reserve.value) + Number(etc.value);
  });
});

async function loadCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const courseList = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    courseList.push({ country: data.country, course: data.course });
  });

  const countries = [...new Set(courseList.map(c => c.country))].sort();
  countrySelect.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join("");
  updateCourseSelect();

  countrySelect.addEventListener("change", updateCourseSelect);

  function updateCourseSelect() {
    const selectedCountry = countrySelect.value;
    const filtered = courseList.filter(c => c.country === selectedCountry);
    courseSelect.innerHTML = filtered.map(c => `<option value="${c.course}">${c.course}</option>`).join("");
  }
}

async function saveData() {
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
}

async function loadSavedData() {
  const snapshot = await getDocs(collection(db, "extra_fees"));
  const rows = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    rows.push(d);
  });

  rows.sort((a, b) => a.country.localeCompare(b.country));
  dataBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.country}</td>
      <td>${r.course}</td>
      <td>${r.tax}</td>
      <td>${r.handling}</td>
      <td>${r.reserve}</td>
      <td>${r.etc}</td>
      <td>${r.total}</td>
      <td><button onclick="editData('${r.country}', '${r.course}')">수정</button></td>
      <td><button onclick="deleteData('${r.country}', '${r.course}')">삭제</button></td>
    </tr>
  `).join("");
}

window.saveData = saveData;
window.editData = async (country, course) => {
  const docRef = doc(db, "extra_fees", `${country}_${course}`);
  const snapshot = await getDocs(collection(db, "extra_fees"));
  snapshot.forEach(docSnap => {
    if (docSnap.id === `${country}_${course}`) {
      const data = docSnap.data();
      countrySelect.value = data.country;
      courseSelect.value = data.course;
      tax.value = data.tax;
      handling.value = data.handling;
      reserve.value = data.reserve;
      etc.value = data.etc;
      total.value = data.total;
    }
  });
};

window.deleteData = async (country, course) => {
  await deleteDoc(doc(db, "extra_fees", `${country}_${course}`));
  loadSavedData();
};

loadCourses();
loadSavedData();
