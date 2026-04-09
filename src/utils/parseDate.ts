export function parseDate(date: string, time: string) {
  const [day, month, year] = date.split('/')
  const [hour, minute] = time.split(':')

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  )
}
