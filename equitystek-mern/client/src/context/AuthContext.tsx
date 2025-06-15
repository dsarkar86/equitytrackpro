import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Define user interface
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

// Define JWT payload interface
interface JwtPayload {
  id: string;
  exp: number;
}

// Define auth state interface
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
}

// Define auth action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: string }
  | { type: 'REGISTER_SUCCESS'; payload: string }
  | { type: 'USER_LOADED'; payload: User }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGIN_FAIL'; payload: string }
  | { type: 'REGISTER_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERRORS' };

// Define auth context interface
interface AuthContextInterface {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
  register: (userData: RegisterFormData) => Promise<void>;
  login: (userData: LoginFormData) => Promise<void>;
  logout: () => void;
  clearErrors: () => void;
}

// Form data interfaces
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Create auth context
const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.type === 'LOGOUT' ? null : action.payload as string
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      // Check if token is valid
      if (state.token) {
        // Check if token is expired
        try {
          const decoded = jwtDecode<JwtPayload>(state.token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            dispatch({ type: 'AUTH_ERROR' });
            return;
          }
          
          // Set auth token in headers
          setAuthToken(state.token);
          
          // Get user data
          const res = await axios.get('/api/auth/user');
          dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData: RegisterFormData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data.token });
    } catch (err: any) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.message || 'Registration failed'
      });
    }
  };

  // Login user
  const login = async (userData: LoginFormData) => {
    try {
      const res = await axios.post('/api/auth/login', userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Invalid credentials'
      });
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Set auth token in headers
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default AuthContext;