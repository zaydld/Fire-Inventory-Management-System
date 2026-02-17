import { Component, OnInit, signal } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Router, RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    MatDialogModule,
    TranslateModule,
  ],
  template: `
    <div class="max-w-5xl mx-auto">

      <!-- HEADER -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-semibold">
          {{ 'MENU.PRODUCTS' | translate }}
        </h1>

        <button mat-raised-button color="primary" routerLink="/products/new">
          <mat-icon class="mr-2">add</mat-icon>
          {{ 'COMMON.NEW' | translate }}
        </button>
      </div>

      <!-- LOADING -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>
      }

      <!-- EMPTY STATE -->
      @else if (products().length === 0) {
        <div class="rounded-2xl border p-6 form-card">
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        </div>
      }

      <!-- TABLE -->
      @else {
        <div class="rounded-2xl border overflow-hidden table-card">
          <table mat-table [dataSource]="products()" class="w-full">

            <!-- NAME -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>
                {{ 'PRODUCTS.COLUMNS.NAME' | translate }}
              </th>
              <td mat-cell *matCellDef="let p">{{ p.name }}</td>
            </ng-container>

            <!-- PRICE -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>
                {{ 'PRODUCTS.COLUMNS.PRICE' | translate }}
              </th>
              <td mat-cell *matCellDef="let p">{{ p.price }}</td>
            </ng-container>

            <!-- QUANTITY -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>
                {{ 'PRODUCTS.COLUMNS.QUANTITY' | translate }}
              </th>
              <td mat-cell *matCellDef="let p">{{ p.quantity }}</td>
            </ng-container>

            <!-- ACTIONS -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>
                {{ 'PRODUCTS.COLUMNS.ACTIONS' | translate }}
              </th>
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
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns; trackBy: trackById"
            ></tr>
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
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
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

        this.translate.get('SNACK.LOAD_FAILED').subscribe((t) => {
          this.snack.open(t, 'OK', { duration: 3000 });
        });
      },
    });
  }

  trackById = (_: number, p: Product) => p.id;

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
            this.translate.get('SNACK.DELETED_SUCCESS').subscribe((t) => {
              this.snack.open(t, 'OK', { duration: 2500 });
            });
            await this.productsQuery.refetch();
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
              this.translate.get('SNACK.DELETE_FORBIDDEN').subscribe((t) => {
                this.snack.open(t, 'OK', { duration: 3000 });
              });
              return;
            }

            this.translate.get('SNACK.DELETE_FAILED').subscribe((t) => {
              this.snack.open(t, 'OK', { duration: 3000 });
            });
          },
        });
    });
  }
}