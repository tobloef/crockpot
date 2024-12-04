import { CustomError } from "./custom-error.js";

export class NotImplementedError extends CustomError {
  constructor() {
    super("Not implemented.");
  }
}