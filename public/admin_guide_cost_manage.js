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
  await renderAllSavedGuideCosts();

  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");
  const filterSelect = document.getElementById("filterCountry");

  const snapshot = await getDocs(collection(db, 'courses'));
  const countryMap = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!countryMap[data.country]) countryMap[data.country] = [];
    countryMap[data.country].push(data.course);
  });

  Object.keys(countryMap).sort().forEach(country => {
    const opt1 = document.createElement("option");
    opt1.value = country;
    opt1.textContent = country;
    countrySelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = country;
    opt2.textContent = country;
    filterSelect.appendChild(opt2);
  });

  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "전체";
  filterSelect.insertBefore(allOpt, filterSelect.firstChild);

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

window.addGuideCostRows = function (clearBeforeAdd = true) {
  if (clearBeforeAdd) document.getElementById("tableContainer").innerHTML = "";

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
      <th>한국가이드 일비</th>
      <th>한국가이드 숙박비</th>
      <th>현지가이드 일비</th>
      <th>현지가이드 숙박비</th>
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
  const sum = (getVal('kr_daily') + getVal('kr_hotel') + getVal('local_daily') + getVal('local_hotel'));
  document.getElementById(`${key}_sum_${nights}`).innerText = `총합이 ${sum.toFixed(2)}$`;
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
  await renderAllSavedGuideCosts();
  if (document.getElementById("filterCountry").value === country || !document.getElementById("filterCountry").value) {
    filterSavedByCountry();
  }
};

window.deleteGuideCost = async function (country, course, nightKey) {
  const key = `${country}_${course}`;
  const ref = doc(db, 'guideCosts', key);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  delete data[nightKey];
  await setDoc(ref, data);
  alert(`${nightKey} 삭제 완료`);
  await renderAllSavedGuideCosts();
  filterSavedByCountry();
};

window.filterSavedByCountry = async function () {
  const selected = document.getElementById("filterCountry").value;
  const view = document.getElementById("savedView");
  const allTables = view.querySelectorAll("table");
  allTables.forEach(table => {
    if (!selected || table.getAttribute("data-country") === selected) {
      table.style.display = "table";
    } else {
      table.style.display = "none";
    }
  });
};

window.renderAllSavedGuideCosts = async function () {
  const view = document.getElementById("savedView");
  view.innerHTML = "";
  const snapshot = await getDocs(collection(db, 'guideCosts'));
  snapshot.forEach(docSnap => {
    const [country, course] = docSnap.id.split("_");
    const table = document.createElement("table");
    table.setAttribute("data-country", country);
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr><th colspan="8">${country} - ${course}</th></tr>
      <tr>
        <th>박수</th><th>한국가이드 일비</th><th>한국가이드 숙박비</th><th>현지가이드 일비</th><th>현지가이드 숙박비</th><th>총합</th><th>수정</th><th>삭제</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const data = docSnap.data();
    Object.keys(data).sort().forEach(dayKey => {
      const val = data[dayKey];
      const sum = (val.korean.daily + val.korean.hotel + val.local.daily + val.local.hotel).toFixed(2);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dayKey}</td>
        <td><input value="${val.korean.daily}" id="edit_${country}_${course}_${dayKey}_krd" /></td>
        <td><input value="${val.korean.hotel}" id="edit_${country}_${course}_${dayKey}_krh" /></td>
        <td><input value="${val.local.daily}" id="edit_${country}_${course}_${dayKey}_locd" /></td>
        <td><input value="${val.local.hotel}" id="edit_${country}_${course}_${dayKey}_loch" /></td>
        <td>${sum} $</td>
        <td><button onclick="saveEdited('${country}', '${course}', '${dayKey}')">💾</button></td>
        <td><button onclick="deleteGuideCost('${country}', '${course}', '${dayKey}')">🗑</button></td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    view.appendChild(table);
  });
};

window.saveEdited = async function (country, course, dayKey) {
  const key = `${country}_${course}`;
  const krd = parseFloat(document.getElementById(`edit_${country}_${course}_${dayKey}_krd`).value) || 0;
  const krh = parseFloat(document.getElementById(`edit_${country}_${course}_${dayKey}_krh`).value) || 0;
  const locd = parseFloat(document.getElementById(`edit_${country}_${course}_${dayKey}_locd`).value) || 0;
  const loch = parseFloat(document.getElementById(`edit_${country}_${course}_${dayKey}_loch`).value) || 0;

  const ref = doc(db, 'guideCosts', key);
  const snap = await getDoc(ref);
  let data = snap.exists() ? snap.data() : {};
  data[dayKey] = {
    korean: { daily: krd, hotel: krh },
    local: { daily: locd, hotel: loch }
  };
  await setDoc(ref, data);
  alert(`${dayKey} 수정 완료`);
  await renderAllSavedGuideCosts();
  filterSavedByCountry();
};
