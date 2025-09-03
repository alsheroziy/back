export function generateUserId(): number {
  let digits = '0123456789';
  let result = '';

  while (result.length < 8) {
    let randomIndex = Math.floor(Math.random() * digits.length);
    let randomDigit = digits[randomIndex];

    if (!result.includes(randomDigit)) {
      result += randomDigit;
    }
  }

  return +result;
}
