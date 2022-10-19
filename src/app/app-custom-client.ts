import {CredentialsInterface, TokenStoreInterface} from "sdkgen-client";
import Client from "fusio-sdk/dist/src/generated/backend/Client";

export default class AppCustomClient extends Client {
  constructor(baseUrl: string, credentials: CredentialsInterface | null | undefined, tokenStore: TokenStoreInterface | undefined, scopes = []) {
    super(baseUrl, credentials, tokenStore, scopes);
  }

  public async backendActionTrashRemove(type: string, data: {id?: number, status?: number}) {
    const url =  this.baseUrl + "/backend/trash/" + type + "";
    let params = {};

    const httpClient = await this.newHttpClient();

    data['status'] = 0;

    return httpClient.post(url, data, params);
  }
}
