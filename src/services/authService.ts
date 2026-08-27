import { apiRequest } from "./api";
import { ENDPOINTS } from "./apiConstants";
import type {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto,
} from "./dto/user.dto";

/** Authentication against the ShopHub backend. */
export const authService = {
  login(credentials: LoginRequestDto): Promise<AuthResponseDto> {
    return apiRequest<AuthResponseDto>(ENDPOINTS.auth.login, {
      method: "POST",
      body: credentials,
    });
  },

  /** Answers with a session, so a new account is signed in right away. */
  register(registration: RegisterRequestDto): Promise<AuthResponseDto> {
    return apiRequest<AuthResponseDto>(ENDPOINTS.auth.register, {
      method: "POST",
      body: registration,
    });
  },

  me(): Promise<UserDto> {
    return apiRequest<UserDto>(ENDPOINTS.auth.me, { authenticated: true });
  },
};
