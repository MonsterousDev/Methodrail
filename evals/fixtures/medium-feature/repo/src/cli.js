export function nameFromArgs(args) {
  return args[0] ?? "world";
}

export function run(args) {
  return `hi ${nameFromArgs(args)}`;
}
