export type EvalProvider = {
  readonly id: string;
  complete(prompt: string, options?: { system?: string }): Promise<string>;
};

export class NoProvider implements EvalProvider {
  readonly id = "none";
  complete(): Promise<string> {
    return Promise.reject(new Error("No LLM provider configured"));
  }
}

export function resolveProvider(): EvalProvider {
  return new NoProvider();
}
