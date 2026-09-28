export class AIDeduplicator {
  private static inFlight = new Map<string, Promise<any>>();

  public static async execute<T>(fingerprint: string, fn: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(fingerprint)) {
      return this.inFlight.get(fingerprint) as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.inFlight.delete(fingerprint);
    });

    this.inFlight.set(fingerprint, promise);
    return promise;
  }

  public static generateFingerprint(taskName: string, params: Record<string, any>): string {
    const serialized = JSON.stringify(params);
    return `${taskName}:${serialized}`;
  }
}
