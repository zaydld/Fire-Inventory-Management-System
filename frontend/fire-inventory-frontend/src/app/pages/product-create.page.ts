import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { removeToken } from '../core/auth-token';

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

type CreateProductPayload = {
  createProduct: { id: string; name: string };
};

@Component({
  selector: 'app-product-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-semibold">New Product</h1>
        <a mat-stroked-button routerLink="/products">Back</a>
      </div>

      <form
        class="rounded-2xl border p-6 form-card"
        [formGroup]="form"
        (ngSubmit)="submit()"
      >
        <!-- name -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls['name'].touched && form.controls['name'].hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
          @if (form.controls['name'].touched && form.controls['name'].hasError('minlength')) {
            <mat-error>Name must be at least 2 characters</mat-error>
          }
        </mat-form-field>

        <!-- description -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- price -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" placeholder="0" />
            @if (form.controls['price'].touched && form.controls['price'].hasError('required')) {
              <mat-error>Price is required</mat-error>
            }
            @if (form.controls['price'].touched && form.controls['price'].hasError('min')) {
              <mat-error>Price must be ≥ 0</mat-error>
            }
          </mat-form-field>

          <!-- quantity -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" placeholder="0" />
            @if (form.controls['quantity'].touched && form.controls['quantity'].hasError('required')) {
              <mat-error>Quantity is required</mat-error>
            }
            @if (form.controls['quantity'].touched && form.controls['quantity'].hasError('min')) {
              <mat-error>Quantity must be ≥ 0</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) { Creating... } @else { Create }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductCreatePageComponent {
  loading = signal(false);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
    });
  }

  submit(): void {
    if (this.loading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as {
      name: string;
      description: string;
      price: number;
      quantity: number;
    };

    const input = {
      name: (raw.name ?? '').trim(),
      description: (raw.description ?? '').trim() || null,
      price: Number(raw.price ?? 0),
      quantity: Number(raw.quantity ?? 0),
    };

    this.loading.set(true);

    this.apollo
      .mutate<CreateProductPayload>({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: { input },
        fetchPolicy: 'no-cache',
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);

          if (!res.data?.createProduct?.id) {
            this.snack.open('Create product failed', 'OK', { duration: 3000 });
            return;
          }

          this.snack.open('Product created successfully', 'OK', {
            duration: 2500,
          });
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('CREATE PRODUCT ERROR:', err);

          const msg =
            (err as any)?.message ||
            (err as any)?.graphQLErrors?.[0]?.message ||
            '';

          if (msg === 'Unauthorized') {
            removeToken();
            this.router.navigate(['/login']);
            return;
          }

          this.snack.open('Create product failed', 'OK', { duration: 3000 });
        },
      });
  }
}