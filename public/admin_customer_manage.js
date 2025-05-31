import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhTfLqagtRiBva_pTbswkl5WhACE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05effa56e81c43595b",
  measurementId: "G-KN3EQN2WLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ 데이터 불러오기
async function loadCustomers() {
  const tbody = document.getElementById("customerList");
  const emptyMessage = document.getElementById("emptyMessage");
  tbody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "users")); // 🔥 여기만 users로 수정

  if (querySnapshot.empty) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.name || ""}</td>
      <td>${data.phone || ""}</td>
      <td>${data.region1 || ""}</td>
      <td>${data.region2 || ""}</td>
      <td>${data.kakao || ""}</td>
      <td class="btn-wrap">
        <button class="edit-btn" disabled>수정</button>
        <button class="delete-btn" onclick="deleteCustomer('${docSnap.id}')">삭제</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// ✅ 삭제
window.deleteCustomer = async function (id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await deleteDoc(doc(db, "users", id));
  alert("삭제되었습니다.");
  loadCustomers();
};

// ✅ 지역 필터 연동
window.updateSubRegion = function () {
  const region1 = document.getElementById("filterRegion1").value;
  const region2 = document.getElementById("filterRegion2");
  region2.innerHTML = '<option value="">전체 시/군/구</option>';

  const regionData = {
    "서울특별시": ["강남구", "종로구", "마포구", "송파구"],
    "경기도": ["성남시", "용인시", "수원시", "고양시"],
    "부산광역시": ["해운대구", "부산진구", "동래구"],
    "대구광역시": ["수성구", "중구", "달서구"]
  };

  if (regionData[region1]) {
    regionData[region1].forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      region2.appendChild(option);
    });
  }
};

// ✅ 검색
window.filterData = async function () {
  const region1 = document.getElementById("filterRegion1").value;
  const region2 = document.getElementById("filterRegion2").value;
  const name = document.getElementById("searchName").value.trim();
  const phone = document.getElementById("searchPhone").value.trim();

  const all = await getDocs(collection(db, "users"));
  const tbody = document.getElementById("customerList");
  const emptyMessage = document.getElementById("emptyMessage");
  tbody.innerHTML = "";

  let hasMatch = false;

  all.forEach(docSnap => {
    const data = docSnap.data();

    const match =
      (!region1 || data.region1 === region1) &&
      (!region2 || data.region2 === region2) &&
      (!name || data.name?.includes(name)) &&
      (!phone || data.phone?.includes(phone));

    if (match) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.name || ""}</td>
        <td>${data.phone || ""}</td>
        <td>${data.region1 || ""}</td>
        <td>${data.region2 || ""}</td>
        <td>${data.kakao || ""}</td>
        <td class="btn-wrap">
          <button class="edit-btn" disabled>수정</button>
          <button class="delete-btn" onclick="deleteCustomer('${docSnap.id}')">삭제</button>
        </td>
      `;

      tbody.appendChild(row);
      hasMatch = true;
    }
  });

  emptyMessage.style.display = hasMatch ? "none" : "block";
};

loadCustomers();
