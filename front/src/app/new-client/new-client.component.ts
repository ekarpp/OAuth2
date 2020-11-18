import { Component, Output, EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html',
  styleUrls: ['./new-client.component.css']
})

@Injectable()
export class NewClientComponent {


  constructor(private http: HttpClient) { }

  @Output() new_client = new EventEmitter<string>();


  get_client(): void {
    this.http.get<{"client_id": string}>(environment.API_URL + "/api/new_client")
      .subscribe(
        res => this.new_client.emit(res.client_id),
        err => this.new_client.emit("error")
      );
  }

}
