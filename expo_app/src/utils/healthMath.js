export function calculateBMR(weightLbs, heightIn, age, gender) {
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightIn * 2.54;
  const genderConst = gender === "Male" ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + genderConst;
}

export function calculateTDEE(bmr, activityLevel) {
  const factors = {
    Sedentary: 1.2,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Extremely Active": 1.9,
  };
  return bmr * (factors[activityLevel] ?? 1.2);
}

export function adjustCalories(tdee, goal) {
  if (goal === "Lose Weight") return tdee * 0.85;
  if (goal === "Gain Weight") return tdee * 1.15;
  return tdee;
}
