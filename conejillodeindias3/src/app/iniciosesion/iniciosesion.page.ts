import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/authenticator.service';

@Component({
  selector: 'app-iniciosesion',
  templateUrl: './iniciosesion.page.html',
  styleUrls: ['./iniciosesion.page.scss'],
})
export class IniciosesionPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  email: string = '';
  password: string = '';


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const userType = 'chofer';  
  
      this.authService.loginChofer(email, password).subscribe({
        next: (authenticatedUser) => {
          console.log(`Chofer autenticado:`, authenticatedUser);
          this.router.navigate(['/profile'], { queryParams: { username: authenticatedUser.name } });
        },
        error: (err) => {
          console.error(`Error al iniciar sesión como chofer:`, err);
          this.errorMessage = 'Correo o contraseña incorrectos.';
        },
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }
  
}