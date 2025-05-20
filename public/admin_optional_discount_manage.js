
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const countrySelect = document.getElementById("country");
const courseSelect = document.getElementById("course");
const discountTable = document.querySelector("#discountTable tbody");
const groupDiscountContainer = document.getElementById("groupDiscountContainer");

async function loadCountryAndCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const map = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!map[data.country]) map[data.country] = [];
    map[data.country].push(data.course);
  });

  countrySelect.innerHTML = "<option value=''>국가 선택</option>";
  Object.keys(map).sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    countrySelect.appendChild(opt);
  });

  countrySelect.addEventListener("change", () => {
    const selected = countrySelect.value;
    courseSelect.innerHTML = "<option value=''>코스 선택</option>";
    (map[selected] || []).forEach(course => {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      courseSelect.appendChild(opt);
    });
  });
}

function addGroupDiscountField() {
  const div = document.createElement("div");
  div.innerHTML = `
    <label>인원 수 이상</label>
    <input type="number" placeholder="예: 8" class="minPeople"/>
    <label>1인당 추가 할인</label>
    <input type="number" placeholder="USD" class="additionalDiscount"/>
  `;
  groupDiscountContainer.appendChild(div);
}

async function saveDiscount() {
  const country = countrySelect.value;
  const course = courseSelect.value;
  const option = document.getElementById("optionType").value;
  const baseDiscount = parseInt(document.getElementById("baseDiscount").value || 0);

  const minPeople = document.querySelectorAll(".minPeople");
  const additionalDiscounts = document.querySelectorAll(".additionalDiscount");
  const groupDiscounts = [];

  for (let i = 0; i < minPeople.length; i++) {
    const mp = parseInt(minPeople[i].value || 0);
    const disc = parseInt(additionalDiscounts[i].value || 0);
    if (mp > 0 && disc >= 0) groupDiscounts.push({ minPeople: mp, discountPerPerson: disc });
  }

  await addDoc(collection(db, "optional_discounts"), {
    country, course, option,
    baseDiscountPerPerson: baseDiscount,
    customGroupDiscounts: groupDiscounts
  });
}

function loadDiscounts() {
  const q = collection(db, "optional_discounts");
  onSnapshot(q, snapshot => {
    discountTable.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const row = document.createElement("tr");
      const extra = d.customGroupDiscounts?.map(g => `${g.minPeople}명 이상: ${g.discountPerPerson} USD`).join("<br>") || "-";
      row.innerHTML = `
        <td>${d.country}</td>
        <td>${d.course}</td>
        <td>${d.option}</td>
        <td>${d.baseDiscountPerPerson} USD</td>
        <td>${extra}</td>
        <td><button onclick="deleteDiscount('${doc.id}')">삭제</button></td>
      `;
      discountTable.appendChild(row);
    });
  });
}

window.deleteDiscount = async function(id) {
  await deleteDoc(doc(db, "optional_discounts", id));
};

loadCountryAndCourses();
loadDiscounts();
