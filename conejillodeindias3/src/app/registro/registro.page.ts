import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';  
import { AuthService } from '../services/authenticator.service';  

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  registroForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,  
    private authService: AuthService  
  ) {}

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], 
    });
  }

  onSubmit() {
    if (this.registroForm.valid) {
      const formData = this.registroForm.value;
      console.log("Datos del formulario:", formData);

      this.authService.registrarUsuario(formData).subscribe({
        next: () => {
          alert('Usuario registrado con éxito.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al registrar usuario:', err);
          alert('Error al registrar usuario. Intenta nuevamente.');
        },
      });
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
}