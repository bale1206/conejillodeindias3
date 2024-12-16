import { Component, OnInit } from '@angular/core';
import { AuthService, Driver } from '../services/authenticator.service'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  username: string = '';

  constructor(private authService: AuthService) {} 

  ngOnInit() {
    this.authService.getAuthenticatedDriver().subscribe((driver: Driver | null) => {
      if (driver) {
        this.username = driver.name; 
        console.log('Chofer autenticado:', driver);
      } else {
        console.log('No se encontró un chofer autenticado');
      }
    });
  }
}