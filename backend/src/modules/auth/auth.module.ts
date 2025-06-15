import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { FirebaseJwtStrategy } from './strategies/firebase-jwt.strategy';
import { EmployeesModule } from '../employees/employees.module';
import { User } from './entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Employee, Organization, Invitation, Department]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
    EmployeesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, FirebaseJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {} 