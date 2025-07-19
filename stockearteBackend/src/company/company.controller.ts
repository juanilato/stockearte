import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // Create of company vinculated to an Register User
  @Post(':id')
  create(@Param('id') id: string, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(+id, createCompanyDto);
  }

  // Get all companies
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  // Get one specific company by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  // Get all companies (name and id) to select
  @Get('all/:id')
  findAllFromUser(@Param('id') id: string) {

    
    const result = this.companyService.findAllFromUser(+id);

    return result;
  }

  // Get all products from company
  @Get('allProducts/:id')
  findAllProducts(@Param('id') id: string) {
    return this.companyService.findAllProducts(+id);
  }

  // Get all materials from company
  @Get('allMaterials/:id')
  findAllMaterials(@Param('id') id: string) {
    return this.companyService.findAllMaterials(+id);
  }

  // Edit company data: name, description
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(+id, updateCompanyDto);
  }

  // Delete company
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }
}
