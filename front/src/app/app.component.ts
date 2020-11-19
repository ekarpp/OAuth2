import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front';

  constructor(public dialog: MatDialog) {}

  output_message(msg: string) {
    this.dialog.open(MessageDialogComponent, {data: {msg: msg}});
  }
}
