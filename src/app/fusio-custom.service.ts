import { Injectable } from '@angular/core';
import {FusioService as Sdk} from "ngx-fusio-sdk";
import Client from "fusio-sdk/dist/src/generated/backend/Client";
import {CredentialsInterface, TokenStoreInterface} from "sdkgen-client";
import AppCustomClient from "./app-custom-client";

@Injectable({
  providedIn: 'root'
})
export class FusioCustomService extends Sdk<AppCustomClient> {
  protected newClient(baseUrl: string, credentials: CredentialsInterface | null | undefined, tokenStore: TokenStoreInterface | undefined): AppCustomClient {
    return new AppCustomClient(baseUrl, credentials, tokenStore);
  }
}
