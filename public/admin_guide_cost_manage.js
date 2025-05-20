// admin_guide_cost_manage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhfTLaqtp1BVUa_iPbksW15Ah0CE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
  measurementId: "G-KN3EQNZWLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let courses = [];

window.onload = async function () {
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");
  const snapshot = await getDocs(collection(db, 'courses'));
  const countryMap = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!countryMap[data.country]) countryMap[data.country] = [];
    countryMap[data.country].push(data.course);
  });

  Object.keys(countryMap).sort().forEach(country => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  countrySelect.onchange = () => {
    const selected = countrySelect.value;
    courseSelect.innerHTML = "";
    (countryMap[selected] || []).sort().forEach(course => {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      courseSelect.appendChild(opt);
    });
  };

  countrySelect.dispatchEvent(new Event("change"));
};

window.addGuideCostRows = function () {
  const country = document.getElementById("countrySelect").value;
  const course = document.getElementById("courseSelect").value;
  const container = document.getElementById("tableContainer");

  const key = `${country}_${course}`;
  const tableId = `table_${key.replace(/\s+/g, '_')}`;
  if (document.getElementById(tableId)) return;

  const table = document.createElement("table");
  table.id = tableId;

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th colspan="9">${country} - ${course}</th>
    </tr>
    <tr>
      <th>박수</th>
      <th>🇰🇷 가이드 일비</th>
      <th>🇰🇷 가이드 숙박비</th>
      <th>🇱🇦 현지 일비</th>
      <th>🇱🇦 현지 숙박비</th>
      <th>총합</th>
      <th>저장</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (let nights = 3; nights <= 7; nights++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nights}박</td>
      <td><input type="number" id="${key}_kr_daily_${nights}" oninput="updateTotal('${key}', ${nights})"></td>
      <td><input type="number" id="${key}_kr_hotel_${nights}" oninput="updateTotal('${key}', ${nights})"></td>
      <td><input type="number" id="${key}_local_daily_${nights}" oninput="updateTotal('${key}', ${nights})"></td>
      <td><input type="number" id="${key}_local_hotel_${nights}" oninput="updateTotal('${key}', ${nights})"></td>
      <td id="${key}_sum_${nights}">-</td>
      <td><button onclick="saveGuideCost('${country}', '${course}', ${nights})">저장</button></td>
    `;
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
};

window.updateTotal = function (key, nights) {
  const getVal = id => parseFloat(document.getElementById(`${key}_${id}_${nights}`)?.value) || 0;
  const sum = (getVal('kr_daily') + getVal('kr_hotel') + getVal('local_daily') + getVal('local_hotel')) * 1;
  document.getElementById(`${key}_sum_${nights}`).innerText = sum.toFixed(2) + ' USD';
};

window.saveGuideCost = async function (country, course, nights) {
  const key = `${country}_${course}`;
  const kr_daily = parseFloat(document.getElementById(`${key}_kr_daily_${nights}`).value) || 0;
  const kr_hotel = parseFloat(document.getElementById(`${key}_kr_hotel_${nights}`).value) || 0;
  const local_daily = parseFloat(document.getElementById(`${key}_local_daily_${nights}`).value) || 0;
  const local_hotel = parseFloat(document.getElementById(`${key}_local_hotel_${nights}`).value) || 0;

  const ref = doc(db, 'guideCosts', key);
  const snap = await getDoc(ref);
  let data = snap.exists() ? snap.data() : {};

  data[`${nights}박`] = {
    korean: { daily: kr_daily, hotel: kr_hotel },
    local: { daily: local_daily, hotel: local_hotel }
  };

  await setDoc(ref, data);
  alert(`${nights}박 저장 완료`);
};
