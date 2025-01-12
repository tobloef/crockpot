const defaultAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

// Shamelessly stolen from nanoid
// https://github.com/ai/nanoid/blame/main/non-secure/index.js

export const randomString = (
  size = 16,
  alphabet = defaultAlphabet
) => {
  let id = ''
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id
}