/** Mirrors `UserResponseDto` on the backend. */
export interface UserDto {
  id: string;
  username: string;
  createdAt: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  user: UserDto;
}
