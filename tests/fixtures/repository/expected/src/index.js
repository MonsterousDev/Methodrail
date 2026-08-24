export function greet(name) {
  return `Hello, ${name}!`;
}

if (process.argv[1]?.endsWith("index.js")) {
  console.log(greet(process.argv[2] ?? "world"));
}
