export class HarnessManifestError extends Error {}

export function parseLinkedHarnessManifest(source: string): { repositoryPath: string };

export function resolveBoundRepository(manifestPath: string): string;
