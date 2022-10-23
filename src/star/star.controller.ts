import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Console } from 'console';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { Role } from 'src/user/role.enum';
import { Roles } from 'src/user/roles.decorator';
import { StarDto } from './star.dto';
import { StarEntity } from './star.entity';
import { StarService } from './star.service';

@Controller('restaurants')
@UseInterceptors(BusinessErrorsInterceptor)
export class StarController {
    
   
    constructor(private readonly starService: StarService) {
       
    }

    @Roles(Role.ADMIN, Role.MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(':restaurantId/stars')
    async create(
        @Param('restaurantId') restaurantId: string, 
        @Body() starDto: StarDto) {
        
        const star: StarEntity = plainToInstance(StarEntity, starDto);
        return await this.starService.create(star, restaurantId);
    }

    @Roles(Role.ADMIN, Role.MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':restaurantId/stars/:starId')
    async update(
        @Param('restaurantId') restaurantId: string, 
        @Param('starId') starId: string, 
        @Body() starDto: StarDto) {

       const star: StarEntity = plainToInstance(StarEntity, starDto);
       return await this.starService.update(restaurantId,  starId, star);
    }

    @Roles(Role.ADMIN, Role.STAFF, Role.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':restaurantId/stars')
    async findOne(@Param('restaurantId') restaurantId: string) {
        return await this.starService.findAllByRestaurant(restaurantId);
    }

    @Roles(Role.ADMIN, Role.SUPERVISOR)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':restaurantId/stars/:starId')
    @HttpCode(204)
    async delete(
        @Param('restaurantId') restaurantId: string,
        @Param('starId') starId: string) {
        return await this.starService.delete(restaurantId,starId);
    }

}
