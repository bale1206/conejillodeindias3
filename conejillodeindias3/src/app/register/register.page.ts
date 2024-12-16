import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/authenticator.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required],
      licensePlate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, lastname, birthdate, licensePlate, email, password } = this.registerForm.value;

      const userData = { name, lastname, birthdate, licensePlate, email, password };

      this.authService.registrarUsuario(userData).subscribe({
        next: (response) => {
          console.log('Usuario registrado:', response);
          alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
          this.router.navigate(['/iniciosesion']);  
        },
        error: (err) => {
          console.error('Error al registrar al usuario:', err);
          alert('Hubo un problema al registrar al usuario. Intenta nuevamente.');
        },
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }
}