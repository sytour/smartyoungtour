
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
let showPaidOnly = false;

async function loadEstimates() {
  const snapshot = await getDocs(collection(db, "estimates_admin"));
  allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  allData.sort((a, b) => (b.departureDate || '').localeCompare(a.departureDate || ''));
  renderTable();
}

function renderTable() {
  const filteredData = showPaidOnly ? allData.filter(d => d.paid) : allData;
  tableBody.innerHTML = '';
  filteredData.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name || ''}</td>
      <td>${item.phone || ''}</td>
      <td>${item.courseName || ''}</td>
      <td>${item.departureDate || ''}</td>
      <td><input type="checkbox" ${item.paid ? 'checked' : ''} onchange="togglePaid('${item.id}', this.checked)"></td>
      <td><button onclick="showDetail(${idx})">보기</button></td>
      <td><button onclick="deleteEstimate('${item.id}')">삭제</button></td>
    `;
    tableBody.appendChild(row);
  });
}

window.togglePaid = async function(id, checked) {
  try {
    await updateDoc(doc(db, "estimates_admin", id), { paid: checked });
    const index = allData.findIndex(d => d.id === id);
    if (index > -1) allData[index].paid = checked;
    renderTable();
  } catch (e) {
    alert("결제 상태 변경 실패");
    console.error(e);
  }
};

window.deleteEstimate = async function(id) {
  if (!confirm("이 견적서를 삭제하시겠습니까?")) return;
  try {
    await deleteDoc(doc(db, "estimates_admin", id));
    allData = allData.filter(d => d.id !== id);
    renderTable();
  } catch (e) {
    alert("삭제 실패");
    console.error(e);
  }
};

window.showDetail = function(index) {
  const d = allData[index];
  detailBox.style.display = 'block';
  detailBox.innerHTML = `
    <h3>견적 상세 정보</h3>
    <p><span class="highlight">호텔 등급:</span> ${d.hotelGrade}</p>
    <p><span class="highlight">룸 수:</span> 싱글 ${d.roomSingle}, 트윈 ${d.roomTwinDouble}, 트리플 ${d.roomTriple}</p>
    <p><span class="highlight">차량:</span> ${d.vehicle}</p>
    <p><span class="highlight">선택관광:</span> ${d.optionalTour}, 쇼핑 ${d.shoppingCount}회</p>
    <p><span class="highlight">총 지상비:</span> $${d.totalGroundCost}</p>
    <p><span class="highlight">1인 지상비:</span> $${d.perPersonCost}</p>
  `;
  detailBox.scrollIntoView({ behavior: 'smooth' });
}

window.applyFilter = function() {
  const name = document.getElementById('filterName').value.trim();
  const phone = document.getElementById('filterPhone').value.trim();
  const filtered = allData.filter(d => {
    return (!name || (d.name || '').includes(name)) &&
           (!phone || (d.phone || '').includes(phone));
  });
  renderTable(filtered);
}

window.resetFilter = function() {
  location.reload();
}

window.toggleViewFilter = function(showPaid) {
  showPaidOnly = showPaid;
  renderTable();
}

loadEstimates();
