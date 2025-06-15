import { Controller, Post, Body, Get, Param, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterWithInvitationDto } from './dto/register-with-invitation.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register-admin')
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Public()
  @Post('register-with-invitation')
  async registerWithInvitation(@Body() registerDto: RegisterWithInvitationDto) {
    return this.authService.registerWithInvitation(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @Public()
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get('me')
  async getCurrentUserProfile(@Request() req: any) {
    return this.authService.getCurrentUserProfile(req.user.userId);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.authService.updateUserProfile(req.user.userId, updateData);
  }
} 