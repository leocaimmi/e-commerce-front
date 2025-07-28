import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, ProductsResponse, Category, CategoriesResponse } from '../../../../core/interfaces/Product';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

interface FilterOptions {
  search: string;
  categoryId: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ProductCardComponent
  ],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Signals for reactive state
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(12);

  // Filter form
  filterForm: FormGroup;
  
  // Filter options (prepared for future use)
  sortOptions = [
    { value: 'name', label: 'Nombre', direction: 'asc' },
    { value: 'price', label: 'Precio: Menor a Mayor', direction: 'asc' },
    { value: 'price', label: 'Precio: Mayor a Menor', direction: 'desc' },
    { value: 'createdAt', label: 'Más Recientes', direction: 'desc' },
    { value: 'createdAt', label: 'Más Antiguos', direction: 'asc' }
  ];

  // Computed values
  hasProducts = computed(() => this.products().length > 0);
  showPagination = computed(() => this.totalElements() > this.pageSize());

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      categoryId: [''],
      minPrice: [null],
      maxPrice: [null],
      sortBy: ['name'],
      sortDir: ['asc']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupUrlParameters();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupUrlParameters(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['search']) {
        this.filterForm.patchValue({ search: params['search'] });
      }
      if (params['categoryId']) {
        this.filterForm.patchValue({ categoryId: params['categoryId'] });
      }
      if (params['page']) {
        this.currentPage.set(parseInt(params['page'], 10));
      }
      
      // Load products after URL parameters are set
      this.loadProducts();
    });
  }

  private setupFilterSubscription(): void {
    // Subscribe to form changes with debounce
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(0); // Reset to first page when filtering
        this.loadProducts();
      });
  }

  private loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CategoriesResponse) => {
          this.categories.set(response.content);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    
    const filters = this.filterForm.value as FilterOptions;
    const [sortBy, sortDir] = this.parseSortOption(filters.sortBy, filters.sortDir);

    const options = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy,
      sortDir,
      // Filtros preparados (comentados hasta implementación en backend)
      // search: filters.search || undefined,
      // categoryId: filters.categoryId || undefined,
      // minPrice: filters.minPrice || undefined,
      // maxPrice: filters.maxPrice || undefined
    };

    this.productService.getProducts(options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductsResponse) => {
          this.products.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading.set(false);
        }
      });
  }

  private parseSortOption(sortBy: string, sortDir: string): [string, 'asc' | 'desc'] {
    // Handle compound sort options from select
    const selectedOption = this.sortOptions.find(opt => 
      `${opt.value}_${opt.direction}` === `${sortBy}_${sortDir}`
    );
    
    if (selectedOption) {
      return [selectedOption.value, selectedOption.direction as 'asc' | 'desc'];
    }
    
    return [sortBy, sortDir as 'asc' | 'desc'];
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  onViewProductDetails(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      // Usuario no logueado, mostrar mensaje o redirigir al login
      console.log('Usuario debe estar logueado para ver detalles');
      // TODO: Mostrar un snackbar o modal informando que debe loguearse
      return;
    }
    
    // TODO: Navigate to product details page
    console.log('View product details:', product);
    // this.router.navigate(['/products', product.id]);
  }

  onAddToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      // Usuario no logueado, mostrar mensaje o redirigir al login
      console.log('Usuario debe estar logueado para agregar al carrito');
      // TODO: Mostrar un snackbar o modal informando que debe loguearse
      return;
    }
    
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
    // This will be connected to cart service later
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      categoryId: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'name',
      sortDir: 'asc'
    });
  }

  // Helper methods for template
  trackByProductId(index: number, product: Product): string {
    return product.id || index.toString();
  }

  getSortDisplayValue(): string {
    const formValue = this.filterForm.value;
    const option = this.sortOptions.find(opt => 
      opt.value === formValue.sortBy && opt.direction === formValue.sortDir
    );
    return option?.label || 'Nombre';
  }
}
