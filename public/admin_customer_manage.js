import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ 스마트영투어 프로젝트에 맞는 Firebase 설정값
const firebaseConfig = {
  apiKey: "AIzaSyDYEovrThfL1qqtR1Bva_pJbswk1l5AhCE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea20d5effa56e01c43595b",
  measurementId: "G-KNSJQNW2WLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const customerList = document.getElementById("customerList");
const emptyMessage = document.getElementById("emptyMessage");

let allCustomers = []; // 전체 데이터 보관용

// 시/도 → 시/군/구 자동 연동용
const regionData = {
  "서울특별시": ["강남구", "종로구", "마포구", "송파구"],
  "경기도": ["성남시", "용인시", "수원시", "고양시"],
  "부산광역시": ["해운대구", "동래구", "부산진구"],
  "대구광역시": ["수성구", "달서구", "중구"]
};

document.getElementById("filterRegion1").addEventListener("change", () => {
  const region1 = document.getElementById("filterRegion1").value;
  const region2 = document.getElementById("filterRegion2");
  region2.innerHTML = '<option value="">전체 시/군/구</option>';
  if (regionData[region1]) {
    regionData[region1].forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      region2.appendChild(opt);
    });
  }
});

// 고객 목록 불러오기
export async function loadCustomers() {
  customerList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "customers"));
  allCustomers = [];

  querySnapshot.forEach(docSnap => {
    allCustomers.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderCustomers(allCustomers);
}

// 고객 테이블 렌더링
function renderCustomers(data) {
  customerList.innerHTML = "";

  if (!data.length) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="text" value="${item.name}" /></td>
      <td><input type="text" value="${item.phone}" /></td>
      <td><input type="text" value="${item.region1}" /></td>
      <td><input type="text" value="${item.region2}" /></td>
      <td><input type="text" value="${item.kakao || ""}" /></td>
      <td>
        <button class="edit-btn">수정</button>
        <button class="delete-btn">삭제</button>
      </td>
    `;

    const inputs = row.querySelectorAll("input");

    row.querySelector(".edit-btn").addEventListener("click", async () => {
      try {
        await updateDoc(doc(db, "customers", item.id), {
          name: inputs[0].value,
          phone: inputs[1].value,
          region1: inputs[2].value,
          region2: inputs[3].value,
          kakao: inputs[4].value
        });
        alert("수정 완료");
      } catch (e) {
        alert("수정 실패");
        console.error(e);
      }
    });

    row.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("정말 삭제하시겠습니까?")) {
        try {
          await deleteDoc(doc(db, "customers", item.id));
          row.remove();
        } catch (e) {
          alert("삭제 실패");
          console.error(e);
        }
      }
    });

    customerList.appendChild(row);
  });
}

// 검색 필터 동작
window.filterData = () => {
  const region1 = document.getElementById("filterRegion1").value;
  const region2 = document.getElementById("filterRegion2").value;
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const phone = document.getElementById("searchPhone").value.trim();

  const filtered = allCustomers.filter(cust =>
    (!region1 || cust.region1 === region1) &&
    (!region2 || cust.region2 === region2) &&
    (!name || (cust.name && cust.name.toLowerCase().includes(name))) &&
    (!phone || (cust.phone && cust.phone.includes(phone)))
  );

  renderCustomers(filtered);
};

// 초기 진입 시 자동 로딩
window.onload = loadCustomers;
