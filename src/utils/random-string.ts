const defaultAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-={}[]|:;'<,.?/~`>";

// Shamelessly stolen from nanoid
// https://github.com/ai/nanoid/blob/main/non-secure/index.js

export const randomString = (
  size = 12,
  alphabet = defaultAlphabet
) => {
  let result = "";

  for (let i = 0; i < size; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}