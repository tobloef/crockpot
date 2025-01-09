import { CustomError } from "./custom-error.ts";

export class NotImplementedError extends CustomError {
  constructor() {
    super("Not implemented.");
  }
}