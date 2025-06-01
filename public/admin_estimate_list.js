import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  allData.sort((a, b) => (b.departureDate || '').localeCompare(a.departureDate || ''));
  renderTable(allData);
}

function renderTable(data) {
  tableBody.innerHTML = '';
  data.forEach((item, idx) => {
    const row = document.createElement('tr');
    const paidLabel = item.isPaid ? "✅" : "❌";

    row.innerHTML = `
      <td>${item.name || ''}</td>
      <td>${item.phone || ''}</td>
      <td>${item.courseName || ''}</td>
      <td>${item.departureDate || ''}</td>
      <td>${paidLabel}</td>
      <td>
        ${
          idx === 0
            ? ''
            : `
          <button onclick="showDetail(${idx})">상세보기</button>
          <button onclick="togglePaid('${item.id}', ${idx})">결제표시</button>
          <button onclick="deleteEstimate('${item.id}')">삭제</button>
        `
        }
      </td>
    `;

    tableBody.appendChild(row);
  });
}

window.showDetail = async function(index) {
  const d = allData[index];
  detailBox.style.display = 'block';

  // 호텔 요금 계산
  let hotelTotal = 0;
  try {
    const snap = await getDocs(collection(db, "hotel_prices"));
    snap.forEach(doc => {
      const data = doc.data();
      if (
        data.course === d.courseName &&
        data.grade === d.hotelGrade
      ) {
        const singlePrice = data.single || 0;
        const twinPrice = data.twin_double || 0;
        const triplePrice = data.triple || 0;

        hotelTotal =
          (parseInt(d.roomSingle || 0) * singlePrice) +
          (parseInt(d.roomTwinDouble || 0) * twinPrice) +
          (parseInt(d.roomTriple || 0) * triplePrice);
      }
    });
  } catch (e) {
    console.error("호텔 요금 계산 실패", e);
  }

  // 식사 요금 계산
  let mealTotal = 0;
  try {
    const snap = await getDocs(collection(db, "meal_prices"));
    let perPersonMeal = 0;
    snap.forEach(doc => {
      const data = doc.data();
      if (data.course === d.courseName) {
        const day = parseInt(data.day);
        const type = data.type;
        const price = parseFloat(data.price || 0);
        const includeDinner = d.includeDinner || false;

        // 조건: 낮 도착 석식 포함 체크 여부
        if (day === 1 && type === "석식" && !includeDinner) {
          return;
        }
        perPersonMeal += price;
      }
    });
    mealTotal = perPersonMeal * parseInt(d.peopleCount || 0);
  } catch (e) {
    console.error("식사 요금 계산 실패", e);
  }

  detailBox.innerHTML = `
    <h3>견적 상세 정보</h3>
    <p><strong>호텔 등급:</strong> ${d.hotelGrade}</p>
    <p><strong>룸 수:</strong> 싱글 ${d.roomSingle}, 트윈 ${d.roomTwinDouble}, 트리플 ${d.roomTriple}</p>
    <p><strong>호텔 총 비용:</strong> $${hotelTotal}</p>
    <p><strong>식사 총 비용:</strong> $${mealTotal}</p>
    <p><strong>차량:</strong> ${d.vehicle}</p>
    <p><strong>선택관광:</strong> ${d.optionalTour}, 쇼핑 ${d.shoppingCount}회</p>
    <p><strong>총 지상비:</strong> $${d.totalGroundCost}</p>
    <p><strong>1인 지상비:</strong> $${d.perPersonCost}</p>
  `;
  detailBox.scrollIntoView({ behavior: 'smooth' });
};

window.togglePaid = async function(id, index) {
  const isPaid = !allData[index].isPaid;
  try {
    await updateDoc(doc(db, "estimates_admin", id), { isPaid });
    allData[index].isPaid = isPaid;
    renderTable(allData);
  } catch (e) {
    alert("결제 상태 업데이트 실패");
  }
};

window.deleteEstimate = async function(id) {
  if (!confirm("정말로 삭제하시겠습니까?")) return;
  try {
    await deleteDoc(doc(db, "estimates_admin", id));
    allData = allData.filter(d => d.id !== id);
    renderTable(allData);
  } catch (e) {
    alert("삭제 실패");
  }
};

window.applyFilter = function() {
  const name = document.getElementById('filterName').value.trim();
  const phone = document.getElementById('filterPhone').value.trim();
  const filtered = allData.filter(d => {
    return (!name || (d.name || '').includes(name)) &&
           (!phone || (d.phone || '').includes(phone));
  });
  renderTable(filtered);
};

window.resetFilter = function() {
  location.reload();
};

loadEstimates();
