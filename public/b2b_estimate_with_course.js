// b2b_estimate_with_course.js
// 이 파일은 Firebase 연동 및 입력값 처리 기능을 담당합니다.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 설정 (당신의 실제 프로젝트 설정으로 바꾸세요)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 호텔 요금 예시 불러오기 (관리자 설정 기반)
export async function loadHotelPrices(course, grade) {
  const hotelRef = collection(db, "hotel_prices");
  const snapshot = await getDocs(hotelRef);
  const data = [];
  snapshot.forEach(doc => {
    const item = doc.data();
    if (item.course === course && item.grade === grade) {
      data.push(item);
    }
  });
  return data;
}

// 예: 추후 여기서 식사, 차량, 할인 등도 불러오도록 확장 가능
