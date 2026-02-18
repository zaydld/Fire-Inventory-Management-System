import { AuthService } from './auth.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apolloMock: { mutate: jest.Mock };

  beforeEach(() => {
    apolloMock = {
      mutate: jest.fn(),
    };

    service = new AuthService(apolloMock as unknown as Apollo);

    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should store token on login success', (done) => {
    apolloMock.mutate.mockReturnValue(
      of({ data: { login: { token: 'JWT_TOKEN' } } })
    );

    service.login('u', 'p').subscribe({
      next: (token) => {
        expect(token).toBe('JWT_TOKEN');
        expect(localStorage.getItem('token')).toBe('JWT_TOKEN');
        done();
      },
      error: done,
    });
  });

  it('should clear token on logout', () => {
    localStorage.setItem('token', 'JWT_TOKEN');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should return true for isLoggedIn if token exists', () => {
    localStorage.setItem('token', 'JWT_TOKEN');

    expect(service.isLoggedIn()).toBe(true);

    localStorage.removeItem('token');

    expect(service.isLoggedIn()).toBe(false);
  });
});
