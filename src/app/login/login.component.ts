import { Component, OnInit } from '@angular/core';
import packageJson from "../../../package.json";
import {Router} from "@angular/router";
import {Message} from "fusio-sdk/dist/src/generated/backend/Message";
import axios from "axios";
import {FusioService} from "../fusio.service";
import {UserService} from "ngx-fusio-sdk";
import {User} from "fusio-sdk/dist/src/generated/backend/User";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  version = packageJson.version;

  credentials: Credentials = {
    username: '',
    password: ''
  }

  response?: Message;
  loading = false

  constructor(private fusio: FusioService, private router: Router, private user: UserService<User>) {
  }

  ngOnInit(): void {
  }

  async login() {
    this.loading = true;

    try {
      const client = this.fusio.getClientWithCredentials(this.credentials.username, this.credentials.password);
      const account = await client.backendAccount();
      const response = await account.getBackendAccount().backendActionAccountGet();

      this.user.login(response.data);

      this.router.navigate(['/']).then(() => {
        location.reload();
      });
    } catch (error) {
      this.loading = false;
      if (axios.isAxiosError(error) && error.response)  {
        this.response = {
          success: false,
          message: error.response.data.error_description || 'An unknown error occurred',
        };
      } else {
        throw error;
      }
    }
  }

}

interface Credentials {
  username: string,
  password: string
}
