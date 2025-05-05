
document.addEventListener("DOMContentLoaded", () => {
  const courseNameDisplay = document.getElementById("courseNameDisplay");
  const generalMealSection = document.getElementById("meal-section-general");
  const golfMealSection = document.getElementById("meal-section-golf");

  // Simulate course name selection from previous step or URL
  const selectedCourseName = "비엔티안 골프"; // Change dynamically as needed
  courseNameDisplay.textContent = selectedCourseName;

  // Determine which meal section to show
  if (selectedCourseName.includes("골프")) {
    generalMealSection.style.display = "none";
    golfMealSection.style.display = "block";
  } else {
    generalMealSection.style.display = "block";
    golfMealSection.style.display = "none";
  }
});
