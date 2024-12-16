import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  username: string = '';  

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    
    this.activatedRoute.queryParams.subscribe((params) => {
      this.username = params['username'] || 'Usuario desconocido';  
      console.log('username:', this.username);  
    });
  }
}