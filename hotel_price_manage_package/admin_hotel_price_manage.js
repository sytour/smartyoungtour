
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEoEvrhTfLaqtqR1Bva_pIbskWl5Ah0CE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.firebasestorage.app",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
  measurementId: "G-KN3EQNZWLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function renderTable() {
  const tableBody = document.getElementById('hotelTable').querySelector('tbody');
  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "hotel_prices"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = `
      <tr>
        <td>${data.country}</td>
        <td>${data.course}</td>
        <td>${data.grade}</td>
        <td>${data.single}</td>
        <td>${data.twin_double}</td>
        <td>${data.triple}</td>
        <td>
          <button onclick="editHotel('${docSnap.id}', '${data.country}', '${data.course}', '${data.grade}', '${data.single}', '${data.twin_double}', '${data.triple}')">수정</button>
          <button onclick="deleteHotel('${docSnap.id}')">삭제</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

window.addHotel = async function() {
  const country = document.getElementById('country').value.trim();
  const course = document.getElementById('course').value.trim();
  const grade = document.getElementById('grade').value;
  const single = parseInt(document.getElementById('single').value) || 0;
  const twin_double = parseInt(document.getElementById('twin_double').value) || 0;
  const triple = parseInt(document.getElementById('triple').value) || 0;

  if (!country || !course) {
    alert('국가명과 코스명을 모두 입력하세요.');
    return;
  }

  await addDoc(collection(db, "hotel_prices"), {
    country, course, grade, single, twin_double, triple
  });

  alert('추가 완료');
  renderTable();
}

window.editHotel = async function(id, oldCountry, oldCourse, oldGrade, oldSingle, oldTwinDouble, oldTriple) {
  const newCountry = prompt("국가명", oldCountry);
  const newCourse = prompt("코스명", oldCourse);
  const newGrade = prompt("호텔 등급 (4성급/5성급)", oldGrade);
  const newSingle = prompt("싱글 금액", oldSingle);
  const newTwinDouble = prompt("트윈/더블 금액", oldTwinDouble);
  const newTriple = prompt("트리플 금액", oldTriple);

  if (newCountry && newCourse && newGrade) {
    const ref = doc(db, "hotel_prices", id);
    await updateDoc(ref, {
      country: newCountry,
      course: newCourse,
      grade: newGrade,
      single: parseInt(newSingle) || 0,
      twin_double: parseInt(newTwinDouble) || 0,
      triple: parseInt(newTriple) || 0
    });
    alert('수정 완료');
    renderTable();
  }
}

window.deleteHotel = async function(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    await deleteDoc(doc(db, "hotel_prices", id));
    alert('삭제 완료');
    renderTable();
  }
}

window.onload = renderTable;
