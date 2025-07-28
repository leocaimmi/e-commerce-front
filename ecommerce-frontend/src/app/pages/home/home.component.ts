import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category, ProductFilter } from '../../core/interfaces/Product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    FormsModule,
    NavbarComponent,
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('1s ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Signals for reactive state
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoadingProducts = signal<boolean>(false);
  isLoadingCategories = signal<boolean>(false);
  showHeroSection = signal<boolean>(true);
  
  // Search and filter state
  currentFilter = signal<ProductFilter>({});
  searchQuery = signal<string>('');
  selectedCategoryId = signal<string>('');
  selectedCategories = signal<Category[]>([]);
  
  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(12);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check if welcome screen should be shown
    this.checkAndShowWelcomeScreen();
    
    // Load categories
    this.loadCategories();
    
    // Watch for route parameter changes (search queries)
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const filter: ProductFilter = {
        search: params['search'] || '',
        categoryId: params['categoryId'] || '',
        page: this.currentPage(),
        size: this.pageSize()
      };
      
      this.searchQuery.set(filter.search || '');
      this.selectedCategoryId.set(filter.categoryId || '');
      this.currentFilter.set(filter);
      
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAndShowWelcomeScreen(): void {
    const WELCOME_STORAGE_KEY = 'welcome-screen-shown';
    const welcomeShown = localStorage.getItem(WELCOME_STORAGE_KEY);
    
    if (!welcomeShown) {
      // Show welcome screen and hide after 5 seconds
      this.showHeroSection.set(true);
      setTimeout(() => {
        this.showHeroSection.set(false);
      }, 5000);
      
      // Mark as shown in localStorage
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    } else {
      // Don't show welcome screen
      this.showHeroSection.set(false);
    }
  }

  clearWelcomeStorage(): void {
    localStorage.removeItem('welcome-screen-shown');
    // Show welcome screen again immediately for testing
    this.checkAndShowWelcomeScreen();
  }

  private loadCategories(): void {
    this.isLoadingCategories.set(true);
    
    this.categoryService.getAllCategoriesSimple()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoadingCategories.set(false);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.isLoadingCategories.set(false);
        }
      });
  }

  private loadProducts(): void {
    this.isLoadingProducts.set(true);
    
    const filter = this.currentFilter();
    
    this.productService.getProducts({
      search: filter.search,
      categoryId: filter.categoryId,
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: 'createdAt',
      sortDir: 'desc'
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
          this.isLoadingProducts.set(false);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoadingProducts.set(false);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    
    // Si hay categorías seleccionadas, usar el filtro especial
    if (this.selectedCategories().length > 0) {
      this.filterProductsBySelectedCategories();
    } else {
      this.loadProducts();
    }
  }

  onSearchQueryChange(): void {
    this.updateUrlWithFilters();
  }

  onCategoryChange(): void {
    this.updateUrlWithFilters();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set('');
    this.router.navigate(['/'], { queryParams: {} });
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set('');
    this.selectedCategories.set([]);
    this.currentPage.set(0); // Reset to first page
    this.router.navigate(['/'], { queryParams: {} });
    this.loadProducts(); // Reload all products
  }

  private updateUrlWithFilters(): void {
    const queryParams: any = {};
    
    if (this.searchQuery()) {
      queryParams.search = this.searchQuery();
    }
    
    if (this.selectedCategoryId()) {
      queryParams.categoryId = this.selectedCategoryId();
    }
    
    this.router.navigate(['/'], { queryParams });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category?.name || '';
  }

  hasActiveFilters(): boolean {
    return Boolean(this.searchQuery() || this.selectedCategoryId() || this.selectedCategories().length > 0);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.onCategoryChange();
  }

  selectAllCategories(): void {
    this.selectedCategoryId.set('');
    this.selectedCategories.set([]);
    this.currentPage.set(0);
    this.router.navigate(['/'], { queryParams: {} });
    this.loadProducts();
  }

  // Nueva funcionalidad para seleccionar múltiples categorías como tags
  toggleCategoryTag(category: Category): void {
    const currentSelected = this.selectedCategories();
    const index = currentSelected.findIndex(cat => cat.id === category.id);
    
    let newSelected: Category[];
    if (index > -1) {
      // Remover categoría si ya está seleccionada
      newSelected = currentSelected.filter(cat => cat.id !== category.id);
    } else {
      // Agregar categoría si no está seleccionada
      newSelected = [...currentSelected, category];
    }
    
    this.selectedCategories.set(newSelected);
    this.filterProductsBySelectedCategories();
  }

  isCategoryTagSelected(category: Category): boolean {
    return this.selectedCategories().some(cat => cat.id === category.id);
  }

  clearCategoryTags(): void {
    this.selectedCategories.set([]);
    this.currentPage.set(0); // Reset to first page
    this.filterProductsBySelectedCategories();
  }

  private filterProductsBySelectedCategories(): void {
    const selectedCategories = this.selectedCategories();
    
    if (selectedCategories.length === 0) {
      // Si no hay categorías seleccionadas, cargar todos los productos
      this.selectedCategoryId.set(''); // Asegurar que no hay categoría individual seleccionada
      this.loadProducts();
    } else {
      // Filtrar productos basado en las categorías seleccionadas
      // Como tenemos múltiples categorías, haremos requests individuales y combinamos
      this.isLoadingProducts.set(true);
      
      const categoryIds = selectedCategories.map(cat => cat.id);
      const filter = this.currentFilter();
      
      // Por ahora, filtraremos por la primera categoría seleccionada
      // En el futuro se puede mejorar para hacer multiple requests o backend support
      this.productService.getProducts({
        search: filter.search,
        categoryId: categoryIds[0], // Usar la primera categoría por ahora
        page: this.currentPage(),
        size: this.pageSize(),
        sortBy: 'createdAt',
        sortDir: 'desc'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.products.set(response.content);
            this.totalElements.set(response.totalElements);
            this.totalPages.set(response.totalPages);
            this.isLoadingProducts.set(false);
          },
          error: (error) => {
            console.error('Error loading filtered products:', error);
            this.isLoadingProducts.set(false);
          }
        });
    }
  }

  getCategoryIcon(categoryName: string): string {
    const categoryIcons: { [key: string]: string } = {
      'Electronics': 'devices',
      'Electronica': 'devices',
      'Clothing': 'checkroom',
      'Ropa': 'checkroom',
      'Books': 'menu_book',
      'Libros': 'menu_book',
      'Home & Garden': 'home',
      'Hogar': 'home',
      'Sports': 'sports_soccer',
      'Deportes': 'sports_soccer',
      'Beauty': 'face',
      'Belleza': 'face',
      'Toys': 'toys',
      'Juguetes': 'toys',
      'Food': 'restaurant',
      'Comida': 'restaurant',
      'Health': 'health_and_safety',
      'Salud': 'health_and_safety',
      'Automotive': 'directions_car',
      'Automotriz': 'directions_car'
    };
    return categoryIcons[categoryName] || 'category';
  }

  onAddToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario debe estar logueado para agregar al carrito');
      // TODO: Mostrar snackbar o modal informando que debe loguearse
      return;
    }
    
    // TODO: Implement add to cart functionality
    console.log('Add to cart from home:', product);
  }

  onViewProductDetails(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario debe estar logueado para ver detalles');
      // TODO: Mostrar snackbar o modal informando que debe loguearse
      return;
    }
    
    // TODO: Navigate to product details page
    console.log('View product details from home:', product);
    // this.router.navigate(['/products', product.id]);
  }

  onToggleFavorite(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario debe estar logueado para agregar a favoritos');
      // TODO: Mostrar snackbar o modal informando que debe loguearse
      return;
    }
    
    // TODO: Implement favorites functionality
    console.log('Toggle favorite from home:', product);
  }

  // Helper method for trackBy
  trackByProductId(index: number, product: Product): string {
    return product.id || index.toString();
  }

  // Helper method for trackBy categories
  trackByCategoryId(index: number, category: Category): string {
    return category.id || index.toString();
  }
}
