import { Component, OnInit, signal } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Router, RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// ✅ Dialog
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';

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

// ✅ Delete mutation (String! car ton backend ne supporte pas ID)
const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
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
    MatDialogModule, // ✅
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
                <button mat-icon-button [routerLink]="['/products', p.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                </button>

                <button mat-icon-button (click)="confirmDelete(p)">
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

  private productsQuery!: QueryRef<{ products: Product[] }>;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // garder une référence pour refetch() après delete
    this.productsQuery = this.apollo.watchQuery<{ products: Product[] }>({
      query: PRODUCTS_QUERY,
      fetchPolicy: 'network-only',
    });

    this.productsQuery.valueChanges.subscribe({
      next: (res) => {
        this.loading.set(res.loading);

        const list = (res.data?.products ?? []).filter(
          (p): p is Product => !!p?.id
        );
        this.products.set(list);
      },
      error: (err: unknown) => {
        this.loading.set(false);

        const msg =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message)
            : '';

        if (msg.includes('Unauthorized')) {
          this.router.navigate(['/login']);
          return;
        }

        this.snack.open('Failed to load products', 'OK', { duration: 3000 });
      },
    });
  }

  confirmDelete(p: Product): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '420px',
      data: { productName: p.name },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.apollo
        .mutate<{ deleteProduct: boolean }>({
          mutation: DELETE_PRODUCT_MUTATION,
          variables: { id: p.id },
          fetchPolicy: 'no-cache',
        })
        .subscribe({
          next: async () => {
            this.snack.open('Product deleted', 'OK', { duration: 2500 });
            await this.productsQuery.refetch(); // ✅ refresh table
          },
          error: (err: unknown) => {
            const msg =
              typeof err === 'object' && err && 'message' in err
                ? String((err as { message?: unknown }).message)
                : '';

            if (msg.includes('Unauthorized')) {
              this.router.navigate(['/login']);
              return;
            }

            if (msg.includes('Forbidden')) {
              this.snack.open('You are not allowed to delete products', 'OK', {
                duration: 3000,
              });
              return;
            }

            this.snack.open('Delete failed', 'OK', { duration: 3000 });
          },
        });
    });
  }
}
