export class CreateCompanyDto {
  nombreEmpresa: string;
  descripcion: string;
  usuarioId: number;
}

// CreateCompanyDto is used to create a new company
// It contains the company name, description, and the ID of the user who owns the company