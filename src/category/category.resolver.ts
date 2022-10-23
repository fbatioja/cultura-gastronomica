import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';
import { CategoryDto } from './category.dto';
import { CategoryEntity } from './category.entity';
import { CategoryService } from './category.service';

@Resolver()
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [CategoryEntity])
  categories(): Promise<CategoryEntity[]> {
    return this.categoryService.findAll();
  }

  @Query(() => CategoryEntity)
  category(@Args('id') id: string): Promise<CategoryEntity> {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => CategoryEntity)
  createCategory(
    @Args('category') categoryDto: CategoryDto,
  ): Promise<CategoryEntity> {
    const category = plainToInstance(CategoryEntity, categoryDto);
    return this.categoryService.create(category);
  }

  @Mutation(() => CategoryEntity)
  updateCategory(
    @Args('id') id: string,
    @Args('category') categoryDto: CategoryDto,
  ): Promise<CategoryEntity> {
    const category = plainToInstance(CategoryEntity, categoryDto);
    return this.categoryService.update(id, category);
  }

  @Mutation(() => String)
  deleteCategory(@Args('id') id: string) {
    this.categoryService.delete(id);
    return id;
  }
}
