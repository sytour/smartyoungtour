import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔧 본인의 Firebase 설정으로 교체해야 함
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const customerList = document.getElementById("customerList");
const emptyMessage = document.getElementById("emptyMessage");

let allCustomers = []; // 전체 불러온 데이터를 저장해두고 필터에 사용

export async function loadCustomers() {
  customerList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "customers"));
  allCustomers = [];

  querySnapshot.forEach(docSnap => {
    allCustomers.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderCustomers(allCustomers);
}

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

window.loadCustomers = loadCustomers;

window.filterData = () => {
  const region = document.getElementById("filterRegion").value;
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const phone = document.getElementById("searchPhone").value.trim();

  const filtered = allCustomers.filter(cust =>
    (!region || cust.region1 === region) &&
    (!name || (cust.name && cust.name.toLowerCase().includes(name))) &&
    (!phone || (cust.phone && cust.phone.includes(phone)))
  );

  renderCustomers(filtered);
};

window.onload = loadCustomers;
