import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CultureProductService } from './culture-product/culture-product.service';
import { CultureRecipeService } from './culture-recipe/culture-recipe.service';
import { CultureService } from './culture/culture.service';
import { ProductService } from './product/product.service';
import { RecipeService } from './recipe/recipe.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);
  const cultureService = application.get(CultureService);
  const cultureRecipeService = application.get(CultureRecipeService);
  const cultureProductService = application.get(CultureProductService);

  const recipesService = application.get(RecipeService);
  const productsService = application.get(ProductService);

  const cultures = await cultureService.findAll();
  const products = await productsService.findAll();
  const recipes = await recipesService.findAll();
  const productsArray = products.slice(0, 10);
  const recipesArray = recipes.slice(0, 10);
  let i = 0;
  console.log('cultura1');
  //for (const culture of cultures) {
  console.log('cultura');
  console.log(cultures[i].id);
  console.log(recipes[i].id);
  console.log(products[i].id);
  await cultureRecipeService.addRecipeCulture(cultures[i].id, recipes[i].id);
  await cultureProductService.addProductCulture(cultures[i].id, products[i].id);
  i++;
  //}
  console.log('Final');
}

bootstrap();
