import { Component, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

// ✅ 1) Query: pré-remplir avec productById
// IMPORTANT: Strawberry chez toi ne supporte pas ID => String!
const PRODUCT_BY_ID_QUERY = gql`
  query ProductById($id: String!) {
    productById(id: $id) {
      id
      name
      description
      price
      quantity
    }
  }
`;

// ✅ 2) Mutation: update
// IMPORTANT: idem => id: String!
const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: String!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
    }
  }
`;

@Component({
  selector: 'app-product-edit-page',
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
        <h1 class="text-3xl font-semibold">Edit Product</h1>
        <a mat-stroked-button routerLink="/products">Back</a>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border bg-white p-6">
          Loading...
        </div>
      } @else if (notFound()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Product not found
        </div>
      } @else {
        <form
          class="rounded-2xl border bg-white p-6"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          <!-- name -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls['name'].touched &&
            form.controls['name'].hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
            @if (form.controls['name'].touched &&
            form.controls['name'].hasError('minlength')) {
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
              <input matInput type="number" formControlName="price" />
              @if (form.controls['price'].touched &&
              form.controls['price'].hasError('required')) {
                <mat-error>Price is required</mat-error>
              }
              @if (form.controls['price'].touched &&
              form.controls['price'].hasError('min')) {
                <mat-error>Price must be ≥ 0</mat-error>
              }
            </mat-form-field>

            <!-- quantity -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity" />
              @if (form.controls['quantity'].touched &&
              form.controls['quantity'].hasError('required')) {
                <mat-error>Quantity is required</mat-error>
              }
              @if (form.controls['quantity'].touched &&
              form.controls['quantity'].hasError('min')) {
                <mat-error>Quantity must be ≥ 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || saving()"
            >
              @if (saving()) { Saving... } @else { Save }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ProductEditPageComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  notFound = signal(false);

  productId = '';
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.productId = id;

    this.apollo
      .query<{ productById: Product | null }>({
        query: PRODUCT_BY_ID_QUERY,
        variables: { id: this.productId },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);

          const p = res.data?.productById ?? null;
          if (!p) {
            this.notFound.set(true);
            return;
          }

          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
            price: p.price ?? 0,
            quantity: p.quantity ?? 0,
          });
        },
        error: (err) => {
          this.loading.set(false);

          const msg = String((err as any)?.message ?? '');

          if (msg.includes('Unauthorized')) {
            this.router.navigate(['/login']);
            return;
          }

          if (msg.toLowerCase().includes('not found')) {
            this.notFound.set(true);
            return;
          }

          this.snack.open('Failed to load product', 'OK', { duration: 3000 });
        },
      });
  }

  submit(): void {
    if (this.form.invalid || this.saving() || this.notFound()) {
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

    this.saving.set(true);

    this.apollo
      .mutate({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: { id: this.productId, input },
        fetchPolicy: 'no-cache',
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Product updated successfully', 'OK', {
            duration: 2500,
          });
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.saving.set(false);

          const msg = String((err as any)?.message ?? '');

          if (msg.includes('Unauthorized')) {
            this.router.navigate(['/login']);
            return;
          }

          if (msg.toLowerCase().includes('not found')) {
            this.notFound.set(true);
            return;
          }

          this.snack.open('Update failed', 'OK', { duration: 3000 });
        },
      });
  }
}
