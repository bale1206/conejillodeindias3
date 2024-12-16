import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage {
  constructor(private navCtrl: NavController) {}

  retry() {
    this.navCtrl.back();
  }
}