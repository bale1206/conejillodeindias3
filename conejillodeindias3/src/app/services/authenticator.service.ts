import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Driver {
  name: string;
  lastname: string;
  birthdate: string;
  licensePlate: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://jxz5le5jo3.execute-api.us-east-2.amazonaws.com/dev';
  private authenticatedUser = new BehaviorSubject<Driver | null>(null);

  constructor(private http: HttpClient) {}

  registrarUsuario(user: Driver): Observable<any> {
    return this.http.post(`${this.apiUrl}/pasajero/register`, user).pipe(
      catchError((error) => {
        console.error('Error al registrar usuario:', error);
        alert('Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.');
        return throwError(() => new Error(`Error al registrar usuario: ${error.message}`));
      })
    );
  }

  recuperarContrasena(email: string): Observable<any> {
    const url = `${this.apiUrl}/recuperar-contrasena`;
    return this.http.post(url, { email }).pipe(
      catchError((error) => {
        console.error('Error al recuperar contraseña:', error);
        return throwError(() => new Error(`Error al recuperar contraseña: ${error.message}`));
      })
    );
  }

  validarCredencialesChofer(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/chofer/login`;
    return this.http.post<any[]>(url, { email, password }).pipe(
      map((users) => {
        console.log('Choferes encontrados:', users);
        if (users && users.length === 1) {
          return users[0];
        } else {
          throw new Error('Credenciales incorrectas.');
        }
      }),
      catchError((error) => {
        console.error('Error al validar credenciales para chofer:', error);
        return throwError(() => new Error(`Error al validar chofer: ${error.message}`));
      })
    );
  }

  validarCredencialesPasajero(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/pasajero/login`;
    return this.http.post<any[]>(url, { email, password }).pipe(
      map((users) => {
        console.log('Pasajeros encontrados:', users);
        if (users && users.length === 1) {
          return users[0];
        } else {
          throw new Error('Credenciales incorrectas.');
        }
      }),
      catchError((error) => {
        console.error('Error al validar credenciales para pasajero:', error);
        return throwError(() => new Error(`Error al validar pasajero: ${error.message}`));
      })
    );
  }

  loginChofer(email: string, password: string): Observable<any> {
    return this.validarCredencialesChofer(email, password).pipe(
      map((user) => {
        if (user) {
          this.setAuthenticatedDriver(user);
          return user;
        } else {
          throw new Error('Credenciales incorrectas.');
        }
      }),
      catchError((error) => {
        console.error('Error al iniciar sesión para chofer:', error);
        return throwError(() => new Error('Error al iniciar sesión.'));
      })
    );
  }

  loginPasajero(email: string, password: string): Observable<any> {
    return this.validarCredencialesPasajero(email, password).pipe(
      map((user) => {
        if (user) {
          this.setAuthenticatedDriver(user);
          return user;
        } else {
          throw new Error('Credenciales incorrectas.');
        }
      }),
      catchError((error) => {
        console.error('Error al iniciar sesión para pasajero:', error);
        return throwError(() => new Error('Error al iniciar sesión.'));
      })
    );
  }

  setAuthenticatedDriver(driver: Driver): void {
    this.authenticatedUser.next(driver);
  }

  getAuthenticatedDriver(): Observable<Driver | null> {
    return this.authenticatedUser.asObservable();
  }

  isConnected(): boolean {
    return !!this.authenticatedUser.getValue();
  }
}