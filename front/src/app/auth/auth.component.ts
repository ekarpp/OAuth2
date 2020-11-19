import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})

export class AuthComponent {
  auth_form = new FormGroup({
    client_id: new FormControl(""),
    redirect_uri: new FormControl("http://localhost/redir"),
    response_type: new FormControl("code")
  });

  on_submit() {
    const vals = this.auth_form.value;
    const query = Object.keys(vals)
      .map(k => `${k}=${vals[k]}`)
      .join("&");
    window.open(environment.API_URL + "/api/auth/?" + query);
  }
}
