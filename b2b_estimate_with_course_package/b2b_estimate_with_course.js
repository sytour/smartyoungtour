// b2b_estimate_with_course.js

// Firebase 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 코스명에 따른 자동 일정 불러오기
async function loadCourseItinerary(courseName) {
  const snapshot = await getDocs(collection(db, "courses"));
  let itineraryText = "자동 일정 표시";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.course === courseName && data.itinerary) {
      itineraryText = data.itinerary;
    }
  });
  return itineraryText;
}

// 초기화 시 URL 파라미터 기반 자동 반영
window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const course = params.get('course') || '';
  const itinerary = params.get('itinerary') || '';

  if (course) {
    document.getElementById('course').value = course;
    updateMealOptions(course);
  }
  if (itinerary) {
    const autoItinerary = await loadCourseItinerary(course);
    document.getElementById('itinerary').value = autoItinerary || itinerary;
  }
});

// 일반/골프 식사 옵션 자동 전환
window.updateMealOptions = function(course) {
  const generalMeal = document.getElementById('generalMeal');
  const golfMeal = document.getElementById('golfMeal');

  if (course.includes('골프')) {
    generalMeal.classList.add('hidden');
    golfMeal.classList.remove('hidden');
  } else {
    golfMeal.classList.add('hidden');
    generalMeal.classList.remove('hidden');
  }
}

// 룸 타입 입력에 따른 총 객실/인원 계산
window.updateTotals = function() {
  const single = parseInt(document.getElementById('single').value) || 0;
  const twin = parseInt(document.getElementById('twin').value) || 0;
  const double = parseInt(document.getElementById('double').value) || 0;
  const triple = parseInt(document.getElementById('triple').value) || 0;
  const totalRooms = single + twin + double + triple;
  const totalPeople = single + (twin + double) * 2 + triple * 3;
  document.getElementById('totalRooms').value = totalRooms;
  document.getElementById('totalPeople').value = totalPeople;
}

// 차량 자동 선택
window.autoSelectVehicle = function() {
  const people = parseInt(document.getElementById('people').value) || 0;
  let vehicle = "";
  if (people <= 6) vehicle = "벤";
  else if (people <= 11) vehicle = "미니버스";
  else if (people >= 12) vehicle = "버스";
  document.getElementById('vehicle').value = vehicle;
}

// 제출 함수
window.submitForm = function() {
  alert('견적서가 생성됩니다.');
}
