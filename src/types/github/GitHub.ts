export default interface GitHub {
  isDebug(): boolean;
  debug(message: string): void;
  getInput(name: string, options?: {required: boolean}): string;
}
