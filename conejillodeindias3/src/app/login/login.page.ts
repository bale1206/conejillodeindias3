import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/authenticator.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService // Servicio para pasajeros
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

      this.authService.loginPasajero(email, password).subscribe({
        next: (authenticatedUser) => {
          console.log(`Pasajero autenticado:`, authenticatedUser);
          this.router.navigate(['/perfil'], { queryParams: { username: authenticatedUser.name } });
        },
        error: (err) => {
          console.error(`Error al iniciar sesión como pasajero:`, err);
          this.errorMessage = 'Correo o contraseña incorrectos.';
        },
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }
}