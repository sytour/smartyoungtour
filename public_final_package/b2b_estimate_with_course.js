// b2b_estimate_with_course.js

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const course = params.get('course') || '';
  const itinerary = params.get('itinerary') || '';

  if (course) {
    document.getElementById('course').value = course;
    updateMealOptions(course);
  }

  if (itinerary) {
    document.getElementById('itinerary').value = decodeURIComponent(itinerary);
  }

  document.getElementById('people').addEventListener('input', autoSelectVehicle);
  ['single', 'twin', 'double', 'triple'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateTotals);
  });
});

function updateMealOptions(course) {
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

function updateTotals() {
  const single = parseInt(document.getElementById('single').value) || 0;
  const twin = parseInt(document.getElementById('twin').value) || 0;
  const double = parseInt(document.getElementById('double').value) || 0;
  const triple = parseInt(document.getElementById('triple').value) || 0;

  const totalRooms = single + twin + double + triple;
  const totalPeople = single + (twin + double) * 2 + triple * 3;

  document.getElementById('totalRooms').value = totalRooms;
  document.getElementById('totalPeople').value = totalPeople;
}

function autoSelectVehicle() {
  const people = parseInt(document.getElementById('people').value) || 0;
  let vehicle = '';

  if (people <= 6) vehicle = '벤';
  else if (people <= 11) vehicle = '미니버스';
  else vehicle = '버스';

  document.getElementById('vehicle').value = vehicle;
}

function submitForm() {
  alert('견적서가 생성됩니다.');
}
