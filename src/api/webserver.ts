import Koa from "koa";
import bodyParser from "koa-bodyparser";

import { isValidAddress } from "../addresses";
import * as constants from "../constants";
import { Faucet } from "../faucet";
import { RequestParser } from "./requestparser";
import { createReadStream } from "fs";
import path from "path";
import cors = require("@koa/cors");

const faucetPath = path.join(__dirname, "../faucet.html");

/** This will be passed 1:1 to the user */
export interface ChainConstants {
  readonly nodeUrl: string;
  readonly chainId: string;
}

export class Webserver {
  private readonly api = new Koa();
  private readonly addressCounter = new Map<string, Date>();

  public constructor(faucet: Faucet, chainConstants: ChainConstants) {
    this.api.use(cors());
    this.api.use(bodyParser());

    this.api.use(async (context) => {
      switch (context.path) {
        case "/":
        case "/healthz":
          const html = createReadStream(faucetPath);
          context.response.set("content-type", "text/html");
          context.body = html;
          break;
        case "/status": {
          const [holder, ...distributors] = await faucet.loadAccounts();
          const availableTokens = await faucet.availableTokens();
          const chainTokens = faucet.configuredTokens();
          context.response.body = {
            status: "ok",
            ...chainConstants,
            chainTokens: chainTokens,
            availableTokens: availableTokens,
            holder: holder,
            distributors: distributors
          };
          break;
        }
        case "/credit": {
          if (context.request.method !== "POST") {
            context.response.body = {
              code: 405,
              msg: "This endpoint requires a POST request"
            };
            break;
          }

          if (context.request.type !== "application/json") {
            context.response.body = {
              code: 415,
              msg: "Content-type application/json expected"
            };
            break;
          }

          // context.request.body is set by the bodyParser() plugin
          const requestBody = (context.request as any).body;
          const creditBody = RequestParser.parseCreditBody(requestBody);
          const { message, address, denom } = creditBody;

          // If there is a message, it means there is an authentication failure
          if (message) {
            context.response.body = {
              code: 400,
              message: message
            };
            break;
          }

          if (!isValidAddress(address, constants.addressPrefix)) {
            context.response.body = {
              code: 400,
              message: "Address is not in the expected format for this chain."
            };
            break;
          }

          const entry = this.addressCounter.get(address);
          if (entry !== undefined) {
            if (entry.getTime() + 24 * 3600 > Date.now()) {
              context.response.body = {
                code: 405,
                message: "Too many request from the same address. Blocked to prevent draining. Please wait 24h and try it again!"
              };
              break;
            }
          }

          const availableTokens = await faucet.availableTokens();
          const matchingDenom = availableTokens.find((availableDenom) => availableDenom === denom);
          if (matchingDenom === undefined) {
            context.response.body = {
              code: 422,
              message: `Token is not available. Available tokens are: ${availableTokens}`
            };
            break;
          }

          try {
            await faucet.credit(address, matchingDenom);
            // Count addresses to prevent draining
            this.addressCounter.set(address, new Date());
          } catch (e) {
            console.error(e);
            context.response.body = {
              code: 500,
              message: "Sending tokens failed"
            };
            break;
          }

          context.response.body = {
            code: 200,
            message: "Sending tokens Success"
          };
          break;
        }
        default:
        // koa sends 404 by default
      }
    });
  }

  public start(port: number): void {
    console.info(`Starting webserver on port ${port} ...`);
    this.api.listen(port);
  }
}
