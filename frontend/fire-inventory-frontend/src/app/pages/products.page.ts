import { Component, OnInit, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Router, RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      price
      quantity
    }
  }
`;

type Product = { id: string; name: string; price: number; quantity: number };

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-semibold">Products</h1>

        <button mat-raised-button color="primary" routerLink="/products/new">
          <mat-icon class="mr-2">add</mat-icon>
          New
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else {
        <div class="rounded-2xl border overflow-hidden bg-white">
          <table mat-table [dataSource]="products()" class="w-full">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let p">{{ p.name }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let p">{{ p.price }}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let p">{{ p.quantity }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p" class="space-x-2">
                <button
                  mat-icon-button
                  [routerLink]="['/products', p.id, 'edit']"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
})
export class ProductsPageComponent implements OnInit {
  displayedColumns = ['name', 'price', 'quantity', 'actions'];

  loading = signal(true);
  products = signal<Product[]>([]);

  constructor(
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar
  ) {}

 
  ngOnInit(): void {
  this.apollo
    .watchQuery<{ products: Product[] }>({
      query: PRODUCTS_QUERY,
      fetchPolicy: 'network-only',
    })
    .valueChanges
    .subscribe({
      next: (res) => {
        // stop spinner
        this.loading.set(res.loading);

        // data -> Product[]
        const products = (res.data?.products ?? []).filter(
          (p): p is Product => !!p?.id
        );
        this.products.set(products);
      },

      error: (err: unknown) => {
        this.loading.set(false);

        // ✅ detect Unauthorized (GraphQL error message)
        const msg =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message)
            : '';

        if (msg.includes('Unauthorized')) {
          this.router.navigate(['/login']);
          return;
        }

        // other errors
        this.snack.open('Failed to load products', 'OK', { duration: 3000 });
      },
    });
}

}
