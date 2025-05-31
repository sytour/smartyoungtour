import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔧 본인의 Firebase 설정으로 변경
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

async function loadCustomers() {
  customerList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "customers"));

  if (querySnapshot.empty) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="text" value="${data.name}" /></td>
      <td><input type="text" value="${data.phone}" /></td>
      <td><input type="text" value="${data.region1}" /></td>
      <td><input type="text" value="${data.region2}" /></td>
      <td><input type="text" value="${data.kakao || ""}" /></td>
      <td>
        <button class="edit-btn">수정</button>
        <button class="delete-btn">삭제</button>
      </td>
    `;

    const inputs = row.querySelectorAll("input");

    row.querySelector(".edit-btn").addEventListener("click", async () => {
      await updateDoc(doc(db, "customers", docSnap.id), {
        name: inputs[0].value,
        phone: inputs[1].value,
        region1: inputs[2].value,
        region2: inputs[3].value,
        kakao: inputs[4].value,
      });
      alert("수정되었습니다.");
    });

    row.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("정말 삭제하시겠습니까?")) {
        await deleteDoc(doc(db, "customers", docSnap.id));
        row.remove();
      }
    });

    customerList.appendChild(row);
  });
}

window.onload = loadCustomers;
