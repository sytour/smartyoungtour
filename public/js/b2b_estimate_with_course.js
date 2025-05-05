// b2b_estimate_with_course.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ 실제 Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDUnNEi2lmQUg0T7i2xyFxUgUou6sKXW7A",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "676186443672",
  appId: "1:676186443672:web:dd3a6f771ddf0fcf4327b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🚗 호텔 요금 불러오기 함수 (코스, 등급 기준)
export async function getHotelPrices(course, grade) {
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

// ✅ JS 연결 확인 로그
console.log('✅ b2b_estimate_with_course.js 연결됨');
