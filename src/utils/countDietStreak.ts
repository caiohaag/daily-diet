export const countDietStreak = (allMeals: { is_diet: boolean }[]) => {
  let maxStreak = 0
  let currentStreak = 0

  for (const meal of allMeals) {
    if (meal.is_diet) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}
