import { signup } from '../actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));
jest.mock('next/cache');

describe('signup', () => {
  let mockSupabase: any;
  let mockFormData: FormData;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    // Create mock FormData
    mockFormData = new FormData();
  });

  describe('Successful signup', () => {
    it('should signup successfully with valid information', async () => {
      // Arrange
      mockFormData.append('email', 'newuser@example.com');
      mockFormData.append('password', 'SecurePass123!');

      mockSupabase.auth.signUp.mockResolvedValue({
        error: null,
        data: { user: { id: 'user-123', email: 'newuser@example.com' } },
      });

      // Act
      try {
        await signup(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/login?message=check-email');
    });

    it('should redirect to login with email confirmation message', async () => {
      // Arrange
      mockFormData.append('email', 'newuser@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({
        error: null,
      });

      // Act
      try {
        await signup(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(redirect).toHaveBeenCalledWith('/login?message=check-email');
    });

    it('should call revalidatePath after successful signup', async () => {
      // Arrange
      mockFormData.append('email', 'newuser@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({
        error: null,
      });

      // Act
      try {
        await signup(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(revalidatePath).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });
  });

  describe('Failed signup', () => {
    it('should redirect to error page when email already exists', async () => {
      // Arrange
      mockFormData.append('email', 'existing@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({
        error: { message: 'User already registered' },
      });

      // Act
      try {
        await signup(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(redirect).toHaveBeenCalledWith('/register?error=signup-failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should reject weak password and redirect to error page', async () => {
      // Arrange
      mockFormData.append('email', 'newuser@example.com');
      mockFormData.append('password', '123'); // weak password

      mockSupabase.auth.signUp.mockResolvedValue({
        error: { message: 'Password should be at least 6 characters' },
      });

      // Act
      try {
        await signup(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: '123',
      });
      expect(redirect).toHaveBeenCalledWith('/register?error=signup-failed');
    });
  });
});
