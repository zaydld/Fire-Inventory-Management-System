import { Component, OnInit, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

const HEALTH_QUERY = gql`
  query Health {
    __typename
  }
`;

@Component({
  selector: 'app-health-page',
  standalone: true,
  template: `
    <div class="p-6 max-w-xl mx-auto">
      <h1 class="text-2xl font-semibold mb-4">Backend Connection</h1>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="text-gray-600">Status:</div>
        <div class="text-lg font-semibold">{{ status() }}</div>
      </div>

      @if (networkError()) {
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Network error
        </div>
      }

      <div class="mt-4">
        <button
          class="px-4 py-2 rounded-lg border"
          (click)="testBackend()"
        >
          Retester
        </button>
      </div>
    </div>
  `,
})
export class HealthPageComponent implements OnInit {
  status = signal('Loading...');
  networkError = signal(false);

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.testBackend();
  }

  async testBackend(): Promise<void> {
    this.status.set('Checking...');
    this.networkError.set(false);

    try {
      await firstValueFrom(
        this.apollo.query({
          query: HEALTH_QUERY,
          fetchPolicy: 'no-cache',
        })
      );

      this.status.set('Connected ✅');
    } catch (err) {
      this.networkError.set(true);
      this.status.set('Disconnected');
      console.error('GraphQL network error:', err);
    }
  }
}
