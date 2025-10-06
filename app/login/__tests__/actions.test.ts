import { login } from '../actions';
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

describe('login', () => {
  let mockSupabase: any;
  let mockFormData: FormData;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    // Create mock FormData
    mockFormData = new FormData();
  });

  describe('Successful login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { id: 'user-123' } },
      });

      // Act & Assert
      await expect(login(mockFormData)).rejects.toThrow();

      // Verify Supabase was called correctly
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify revalidatePath was called
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');

      // Verify redirect was called to home page
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should call revalidatePath with correct parameters', async () => {
      // Arrange
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      // Act
      try {
        await login(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(revalidatePath).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('should redirect to home page after successful login', async () => {
      // Arrange
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      // Act
      try {
        await login(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(redirect).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('Failed login', () => {
    it('should redirect to error page with invalid credentials', async () => {
      // Arrange
      mockFormData.append('email', 'wrong@example.com');
      mockFormData.append('password', 'wrongpassword');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      // Act
      try {
        await login(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(redirect).toHaveBeenCalledWith('/login?error=invalid-credentials');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle empty email', async () => {
      // Arrange
      mockFormData.append('email', '');
      mockFormData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Email is required' },
      });

      // Act
      try {
        await login(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '',
        password: 'password123',
      });
      expect(redirect).toHaveBeenCalledWith('/login?error=invalid-credentials');
    });

    it('should handle empty password', async () => {
      // Arrange
      mockFormData.append('email', 'test@example.com');
      mockFormData.append('password', '');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Password is required' },
      });

      // Act
      try {
        await login(mockFormData);
      } catch (error) {
        // redirect throws an error in tests
      }

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '',
      });
      expect(redirect).toHaveBeenCalledWith('/login?error=invalid-credentials');
    });
  });
});
