import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category, CreateProductRequest } from '../../../core/interfaces/Product';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  
  productForm: FormGroup;
  categoryForm: FormGroup;
  isLoading = false;
  isCreatingCategory = false;
  isLoadingCategories = false;
  showCategoryForm = false;
  categories: Category[] = [];
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Inicializar el formulario del producto
    this.productForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      shortDescription: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imageUrl: [''], // Campo opcional
      categoryId: ['', [Validators.required]]
    });

    // Inicializar el formulario de categoría
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Carga las categorías disponibles
   */
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.content || categories;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingCategories = false;
      }
    });
  }

  /**
   * Alterna el formulario de creación de categoría
   */
  toggleCategoryForm(): void {
    this.showCategoryForm = !this.showCategoryForm;
    if (this.showCategoryForm) {
      this.categoryForm.reset();
    }
  }

  /**
   * Crea una nueva categoría
   */
  onCreateCategory(): void {
    if (this.categoryForm.valid) {
      this.isCreatingCategory = true;
      
      const categoryData = {
        name: this.categoryForm.value.name.trim(),
        description: this.categoryForm.value.description?.trim() || ''
      };

      this.categoryService.createCategory(categoryData).subscribe({
        next: (newCategory: Category) => {
          this.snackBar.open('Categoría creada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Agregar la nueva categoría a la lista
          this.categories.push(newCategory);

          // Seleccionar automáticamente la nueva categoría
          this.productForm.patchValue({
            categoryId: newCategory.id
          });

          // Cerrar el formulario
          this.showCategoryForm = false;
          this.categoryForm.reset();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.snackBar.open('Error al crear la categoría', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isCreatingCategory = false;
        }
      });
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  /**
   * Crea un nuevo producto
   */
  onCreateProduct(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      
      const formValue = this.productForm.value;
      
      const productData: CreateProductRequest = {
        sku: formValue.sku.trim(),
        name: formValue.name.trim(),
        shortDescription: formValue.shortDescription.trim(),
        price: parseFloat(formValue.price),
        stock: parseInt(formValue.stock, 10),
        imageUrl: formValue.imageUrl?.trim() || '', // Campo opcional
        category: { id: formValue.categoryId }
      };

      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Navegar de vuelta al home
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          
          let errorMessage = 'Error al crear el producto';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.productForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  /**
   * Cancela la creación y regresa
   */
  onCancel(): void {
    this.router.navigate(['/']);
  }

  /**
   * Verifica si una URL de imagen es válida
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return true; // Campo opcional
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string, formGroup: FormGroup = this.productForm): string {
    const field = formGroup.get(fieldName);
    
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min}`;
      }
      if (field.errors['email']) {
        return `${this.getFieldLabel(fieldName)} debe ser un email válido`;
      }
      if (fieldName === 'imageUrl') {
        return 'La URL de imagen no es válida';
      }
    }
    
    return '';
  }

  /**
   * Obtiene la etiqueta amigable para un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sku: 'SKU',
      name: 'Nombre',
      shortDescription: 'Descripción',
      price: 'Precio',
      stock: 'Stock',
      imageUrl: 'URL de imagen',
      categoryId: 'Categoría'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Selecciona una categoría
   */
  selectCategory(categoryId: string): void {
    this.productForm.patchValue({ categoryId });
  }

  /**
   * TrackBy function para optimizar el ngFor de categorías
   */
  trackByCategory(index: number, category: Category): any {
    return category.id;
  }

  /**
   * Obtiene el ícono apropiado para una categoría
   */
  getCategoryIcon(categoryName: string | undefined): string {
    if (!categoryName) return 'category';
    
    const iconMap: { [key: string]: string } = {
      'Books': 'menu_book',
      'Clothes': 'checkroom',
      'Entertainment': 'games',
      'Food': 'restaurant',
      'Sports': 'sports_soccer',
      'Electronics': 'devices',
      'Home': 'home',
      'Beauty': 'face',
      'Health': 'health_and_safety',
      'Automotive': 'directions_car',
      'Garden': 'yard',
      'Kids': 'child_care',
      'Pets': 'pets',
      'Office': 'business',
      'Music': 'library_music',
      'Travel': 'flight',
      'Art': 'palette',
      'Fitness': 'fitness_center'
    };
    
    // Buscar coincidencia exacta o parcial
    const exactMatch = iconMap[categoryName];
    if (exactMatch) return exactMatch;
    
    // Buscar coincidencia parcial (case insensitive)
    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    // Ícono por defecto
    return 'category';
  }
}
