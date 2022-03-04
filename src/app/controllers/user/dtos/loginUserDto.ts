import { IsString } from 'class-validator';

export class LoginUserBodyDto {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class LoginUserResponseData {
  public constructor(public readonly token: string) {}
}

export class LoginUserResponseDto {
  public constructor(public readonly data: LoginUserResponseData, public readonly statusCode: number) {}
}
