// Social login Dto, not implemented yet
export class SocialLoginDto {
  provider: 'google' | 'facebook' | 'apple';
  accessToken: string;
  email?: string;
  name?: string;
  picture?: string;
}
