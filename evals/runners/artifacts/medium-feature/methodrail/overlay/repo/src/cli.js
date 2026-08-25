export function nameFromArgs(args) {
  return args[0] ?? "world";
}

export function run(args) {
  if (args[0] === "--greet") {
    return `hello, ${nameFromArgs(args.slice(1))}`;
  }
  return `hi ${nameFromArgs(args)}`;
}
