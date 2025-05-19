// ✅ Firebase 연동 (실제 설정 적용)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

let coursesData = {}; // { "라오스_비엔티안 골프": { option: "유", attractions: [...] } }

window.onload = async function() {
  await loadCourses();
  renderCourseList();
};

async function loadCourses() {
  const snapshot = await getDocs(collection(db, 'courses'));
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");
  countrySelect.innerHTML = "";
  courseSelect.innerHTML = "";

  const countries = new Set();
  const courses = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    countries.add(data.country);
    courses.push({ country: data.country, course: data.course });
  });

  [...countries].sort().forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.innerText = c;
    countrySelect.appendChild(option);
  });

  countrySelect.onchange = () => {
    courseSelect.innerHTML = "";
    const selected = countrySelect.value;
    courses.filter(c => c.country === selected).sort((a,b)=>a.course.localeCompare(b.course)).forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.course;
      opt.innerText = item.course;
      courseSelect.appendChild(opt);
    });
  };

  countrySelect.dispatchEvent(new Event("change"));
}

window.addCourse = function() {
  const country = document.getElementById("countrySelect").value;
  const course = document.getElementById("courseSelect").value;
  const option = document.querySelector("input[name='optionType']:checked");

  if (!option) {
    alert("옵션 유 또는 옵션 무를 선택해주세요.");
    return;
  }

  const key = `${country}_${course}`;
  if (coursesData[key]) return;

  coursesData[key] = { option: option.value, attractions: [] };
  renderCourseList();
};

function renderCourseList() {
  const container = document.getElementById("courseListContainer");
  container.innerHTML = "";

  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = `
    <th>국가</th>
    <th>코스</th>
    <th>옵션</th>
    <th>관광지 이름</th>
    <th>입장료 (USD)</th>
    <th>저장/수정</th>
    <th>삭제</th>
  `;
  table.appendChild(header);

  Object.keys(coursesData).sort().forEach(key => {
    const safeKey = key.replace(/\s+/g, '_');
    const [country, course] = key.split("_");
    const courseData = coursesData[key];

    if (courseData.attractions.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${country}</td>
        <td>${course}</td>
        <td>${courseData.option}</td>
        <td colspan='4'><em>아직 입력된 관광지가 없습니다</em></td>
      `;
      table.appendChild(row);
    } else {
      courseData.attractions.forEach((attraction, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx === 0 ? country : ''}</td>
          <td>${idx === 0 ? course : ''}</td>
          <td>${idx === 0 ? courseData.option : ''}</td>
          <td><input id='name_${safeKey}_${idx}' type='text' value='${attraction.name}' /></td>
          <td><input id='fee_${safeKey}_${idx}' type='number' value='${attraction.fee}' /></td>
          <td><button onclick='handleSaveClick(this)' data-key='${safeKey}' data-idx='${idx}'>저장/수정</button></td>
          <td><button onclick='deleteAttraction("${safeKey}", ${idx})'>삭제</button></td>
        `;
        table.appendChild(row);
      });
    }

    const totalRow = document.createElement("tr");
    const total = courseData.attractions.reduce((sum, a) => sum + a.fee, 0);
    totalRow.innerHTML = `<td colspan='7'><strong>총 입장료: ${total.toFixed(2)} USD</strong></td>`;
    table.appendChild(totalRow);

    const addRow = document.createElement("tr");
    addRow.innerHTML = `<td colspan='7'><button onclick='addAttraction("${safeKey}")'>관광지 추가</button></td>`;
    table.appendChild(addRow);
  });

  container.appendChild(table);
}

window.addAttraction = function(safeKey) {
  const key = Object.keys(coursesData).find(k => k.replace(/\s+/g, '_') === safeKey);
  if (!key) return;
  coursesData[key].attractions.push({ name: "", fee: 0 });
  renderCourseList();
};

function handleSaveClick(button) {
  const safeKey = button.getAttribute('data-key');
  const idx = parseInt(button.getAttribute('data-idx'), 10);

  const nameInput = document.getElementById(`name_${safeKey}_${idx}`);
  const feeInput = document.getElementById(`fee_${safeKey}_${idx}`);
  if (!nameInput || !feeInput) return;

  const name = nameInput.value.trim();
  const fee = parseFloat(feeInput.value);

  if (!name || isNaN(fee)) {
    alert("관광지 이름과 유효한 입장료를 입력해주세요.");
    return;
  }

  const key = Object.keys(coursesData).find(k => k.replace(/\s+/g, '_') === safeKey);
  if (!key || !coursesData[key] || !coursesData[key].attractions[idx]) return;

  // ✅ 값 반영
  coursesData[key].attractions[idx].name = name;
  coursesData[key].attractions[idx].fee = fee;

  // ✅ 버튼 피드백
  button.textContent = "✔ 저장됨";
  setTimeout(() => {
    button.textContent = "저장/수정";
  }, 1000);

  // ✅ 총 입장료 셀 정확히 찾아서 업데이트
  const allRows = Array.from(button.closest("table").rows);
  const lastRow = allRows.find(r => r.innerHTML.includes("총 입장료"));
  if (lastRow) {
    const total = coursesData[key].attractions.reduce((sum, a) => sum + a.fee, 0);
    lastRow.cells[0].innerHTML = `<strong>총 입장료: ${total.toFixed(2)} USD</strong>`;
  }
}
