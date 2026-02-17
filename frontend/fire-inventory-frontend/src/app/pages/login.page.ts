import { Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule, // ✅ pipe translate
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-md">

        <div class="mb-6 text-center">
          <h1 class="text-2xl font-semibold">
            {{ 'LOGIN.TITLE' | translate }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ 'APP.TITLE' | translate }}
          </p>
        </div>

        <div class="rounded-2xl border p-6 shadow-sm form-card bg-white dark:bg-slate-900 dark:border-slate-700">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'LOGIN.USERNAME' | translate }}</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
              @if (form.controls.username.touched && form.controls.username.hasError('required')) {
                <mat-error>{{ 'LOGIN.USERNAME_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'LOGIN.PASSWORD' | translate }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                autocomplete="current-password"
              />
              @if (form.controls.password.touched && form.controls.password.hasError('required')) {
                <mat-error>{{ 'LOGIN.PASSWORD_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              class="w-full"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                {{ 'LOGIN.SIGNING_IN' | translate }}
              } @else {
                {{ 'LOGIN.SUBMIT' | translate }}
              }
            </button>

          </form>
        </div>

      </div>
    </div>
  `,
})
export class LoginPageComponent {
  loading = signal(false);

  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor(
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {}

  private toast(key: string): void {
    // ✅ snackbar traduit
    const msg = this.translate.instant(key);
    this.snack.open(msg, 'OK', { duration: 3000 });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

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
            this.toast('LOGIN.INVALID_CREDENTIALS');
            return;
          }

          localStorage.setItem('token', token);
          this.router.navigateByUrl('/products');
        },
        error: (err) => {
          this.loading.set(false);

          const msg = String((err as any)?.message ?? '');

          if (msg.includes('Invalid credentials')) {
            this.toast('LOGIN.INVALID_CREDENTIALS');
            return;
          }

          this.toast('COMMON.SERVER_UNREACHABLE');
        },
      });
  }
}
