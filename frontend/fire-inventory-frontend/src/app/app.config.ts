import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

// Apollo Angular (HttpLink Angular)
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

// Token helper
import { getToken } from './core/auth-token';

// Router + i18n
import { Router } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

function isUnauthorized(err: any) {
  const code = err?.extensions?.code;
  const msg = String(err?.message ?? '');
  return code === 'UNAUTHENTICATED' || msg.includes('Unauthorized');
}

function isForbidden(err: any) {
  const code = err?.extensions?.code;
  const msg = String(err?.message ?? '');
  return code === 'FORBIDDEN' || msg.includes('Forbidden');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MatToolbarModule, MatButtonModule),

    // ngx-translate
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
    }),

    // Apollo
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const router = inject(Router);
      const snack = inject(MatSnackBar);
      const i18n = inject(TranslateService);

      const http = httpLink.create({ uri: environment.graphqlUri });

      // ✅ IMPORTANT : headers = HttpHeaders (Angular)
      const authLink = setContext((_, ctx: any) => {
        const token = getToken();
        let headers: HttpHeaders = ctx?.headers instanceof HttpHeaders ? ctx.headers : new HttpHeaders();

        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return { headers };
      });

      // ✅ typer en any pour éviter l’erreur TS2339
      const errorLink = onError((e: any) => {
        const { graphQLErrors, networkError } = e;

        // Network error
        if (networkError) {
          snack.open(i18n.instant('ERRORS.SERVER_UNREACHABLE'), 'OK', { duration: 3000 });
          return;
        }

        // GraphQL errors
        if (graphQLErrors?.length) {
          for (const err of graphQLErrors) {
            if (isUnauthorized(err)) {
              localStorage.removeItem('token');
              snack.open(i18n.instant('ERRORS.SESSION_EXPIRED'), 'OK', { duration: 3000 });
              router.navigate(['/login']);
              return;
            }

            if (isForbidden(err)) {
              snack.open(i18n.instant('ERRORS.ACCESS_DENIED'), 'OK', { duration: 3000 });
              return;
            }
          }
        }
      });

      return {
        link: ApolloLink.from([errorLink, authLink, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
