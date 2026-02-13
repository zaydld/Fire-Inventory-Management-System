import { Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { MatSnackBar } from '@angular/material/snack-bar';

// ✅ Material imports (standalone)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
      }
    }
  }
`;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-semibold">Sign in</h1>
          <p class="text-gray-600 mt-1">Fire Inventory Management</p>
        </div>

        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
              @if (form.controls.username.touched && form.controls.username.invalid) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                autocomplete="current-password"
              />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              class="w-full"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) { Signing in... } @else { Login }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  loading = signal(false);

  // ✅ inject fb to avoid "used before init"
  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor(
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    const username = this.form.value.username?.trim() ?? '';
    const password = this.form.value.password ?? '';

    this.loading.set(true);

    this.apollo
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
        fetchPolicy: 'no-cache',
      })
      .subscribe({
        next: (result) => {
          this.loading.set(false);

          const payload: any = (result.data as any)?.login;
          const token: string | undefined = payload?.token;

          if (!token) {
            this.snack.open('Invalid credentials', 'OK', { duration: 3000 });
            return;
          }

          localStorage.setItem('token', token);
          this.router.navigateByUrl('/products');
        },
        error: (err) => {
          this.loading.set(false);

          const msg = String(err?.message ?? '');

          if (msg.includes('Invalid credentials')) {
            this.snack.open('Invalid credentials', 'OK', { duration: 3000 });
            return;
          }

          this.snack.open('Server unreachable', 'OK', { duration: 3000 });
        },
      });
  }
}
