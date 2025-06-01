
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firestore 객체 생성
const db = getFirestore();

// 호텔 요금 계산 함수
export async function calculateHotelCost(courseName, hotelGrade, roomSingle, roomTwinDouble, roomTriple) {
  try {
    const hotelRef = collection(db, "hotel_prices");
    const q = query(hotelRef,
      where("courseName", "==", courseName),
      where("grade", "==", hotelGrade)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("해당 호텔 요금 데이터가 없습니다.");
      return 0;
    }

    const hotelData = snapshot.docs[0].data();
    const singlePrice = parseFloat(hotelData.single || 0);
    const twinPrice = parseFloat(hotelData.twin || 0);
    const triplePrice = parseFloat(hotelData.triple || 0);

    const total =
      (roomSingle * singlePrice) +
      (roomTwinDouble * twinPrice) +
      (roomTriple * triplePrice);

    return total;

  } catch (error) {
    console.error("호텔 요금 계산 오류:", error);
    return 0;
  }
}
