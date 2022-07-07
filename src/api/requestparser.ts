import { isNonNullObject } from "@cosmjs/utils";

export interface CreditRequestBodyData {
  /** The Error message */
  readonly message: string;
  /** The base denomination */
  readonly denom: string;
  /** The recipient address */
  readonly address: string;
}

export interface CreditRequestBodyDataWithTicker {
  /** The ticker symbol */
  readonly ticker: string;
  /** The recipient address */
  readonly address: string;
}

export class RequestParser {
  public static parseCreditBody(body: unknown): CreditRequestBodyData {
    let message = "";

    if (!isNonNullObject(body) || Array.isArray(body)) {
      message = "Request body must be a dictionary.";
    }

    const { address, denom, ticker } = body as any;

    if (typeof ticker !== "undefined") {
      message = "The 'ticker' field was removed in CosmJS 0.23. Please use 'denom' instead.";
    }

    if (typeof address !== "string") {
      message = "Property 'address' must be a string.";
    }

    if (address.length === 0) {
      message = "Property 'address' must not be empty.";
    }

    if (typeof denom !== "string") {
      message = "Property 'denom' must be a string.";
    }

    if (denom.length === 0) {
      message = "Property 'denom' must not be empty.";
    }

    return {
      message: message,
      address: address,
      denom: denom,
    };
  }
}
