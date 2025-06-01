import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhfTLtaqqtR1Bva_IPbKsW15AhcE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05fefa56e81c43595b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tableBody = document.querySelector("#estimateTable tbody");
const detailBox = document.getElementById("estimateDetails");
let allData = [];

async function loadEstimates() {
  const snapshot = await getDocs(collection(db, "estimates_admin"));
  allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = "";
  allData.forEach((data, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${data.name || ""}</td>
      <td>${data.phone || ""}</td>
      <td>${data.region1 || ""} ${data.region2 || ""}</td>
      <td>${data.course || ""}</td>
      <td>${data.peopleCount || ""}</td>
      <td>${data.totalCost || ""}</td>
      <td>${data.perPersonCost || ""}</td>
      <td>
        <button onclick="togglePaid('${data.id}')">
          ${data.paid ? "✅ 결제완료" : "❌ 미결제"}
        </button>
      </td>
      <td>
        <button onclick="showDetails('${data.id}')">보기</button>
        <button onclick="deleteEstimate('${data.id}')">삭제</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function deleteEstimate(id) {
  if (confirm("정말 삭제하시겠습니까?")) {
    await deleteDoc(doc(db, "estimates_admin", id));
    allData = allData.filter(d => d.id !== id);
    renderTable();
    detailBox.innerHTML = "";
  }
}

async function togglePaid(id) {
  const docRef = doc(db, "estimates_admin", id);
  const estimate = allData.find(d => d.id === id);
  const newStatus = !estimate.paid;
  await updateDoc(docRef, { paid: newStatus });
  estimate.paid = newStatus;
  renderTable();
}

function showDetails(id) {
  const data = allData.find(d => d.id === id);
  if (!data) return;

  const roomInfo = data.rooms
    ? Object.entries(data.rooms).map(([type, count]) => `${type}: ${count}개`).join(", ")
    : "";

  const mealInfo = (data.meals || []).map(m => `${m.day}: ${m.menu}`).join("<br>");

  const html = `
    <h3>견적 상세 보기</h3>
    <p><strong>코스:</strong> ${data.course || ""}</p>
    <p><strong>호텔 등급:</strong> ${data.hotelGrade || ""}</p>
    <p><strong>객실 구성:</strong> ${roomInfo}</p>
    <p><strong>차량:</strong> ${data.vehicleType || ""}</p>
    <p><strong>식사:</strong><br>${mealInfo}</p>
    <p><strong>입장료:</strong> $${data.entryFeeTotal || 0}</p>
    <p><strong>가이드비:</strong> $${data.guideFee || 0}</p>
    <p><strong>선택관광:</strong> $${data.optionalFee || 0}</p>
    <p><strong>기타 비용:</strong> $${data.miscFee || 0}</p>
    <p><strong>총 지상비:</strong> $${data.totalCost || 0}</p>
    <p><strong>1인당 지상비:</strong> $${data.perPersonCost || 0}</p>
  `;
  detailBox.innerHTML = html;
}

loadEstimates();
