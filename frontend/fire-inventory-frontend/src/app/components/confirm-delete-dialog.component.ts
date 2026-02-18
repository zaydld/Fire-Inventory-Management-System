import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    TranslateModule // ✅ IMPORTANT
  ],
  template: `
    <!-- ✅ Titre traduit -->
    <h2 mat-dialog-title>
      {{ 'DIALOG.DELETE_TITLE' | translate }}
    </h2>

    <!-- ✅ Message avec variable dynamique -->
    <div mat-dialog-content class="py-2">
      {{ 'DIALOG.DELETE_CONFIRM' | translate:{ name: data.productName } }}
    </div>

    <!-- ✅ Boutons traduits -->
    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">
        {{ 'COMMON.CANCEL' | translate }}
      </button>

      <button mat-raised-button color="warn" (click)="confirm()">
        {{ 'COMMON.DELETE' | translate }}
      </button>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productName?: string }
  ) {}

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
