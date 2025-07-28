import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, CreateProductRequest, ProductsResponse } from '../interfaces/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private readonly BASE_URL = `${environment.apiUrl}api/v1/products`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos con paginación y filtros
   * @param options Opciones de consulta
   * @returns Observable con la respuesta paginada de productos
   */
  getProducts(options: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    // Filtros preparados para futuro uso
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
    search?: string;
  } = {}): Observable<ProductsResponse> {
    const {
      page = 0,
      size = 20,
      sortBy = 'name',
      sortDir = 'asc',
      minPrice,
      maxPrice,
      categoryId,
      search
    } = options;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy}`);

    // Filtros preparados (comentados hasta que estén disponibles en el backend)
    // if (minPrice !== undefined) {
    //   params = params.set('minPrice', minPrice.toString());
    // }
    // if (maxPrice !== undefined) {
    //   params = params.set('maxPrice', maxPrice.toString());
    // }
    // if (categoryId) {
    //   params = params.set('categoryId', categoryId);
    // }
    // if (search) {
    //   params = params.set('search', search);
    // }

    return this.http.get<ProductsResponse>(this.BASE_URL, { params })
      .pipe(
        tap(response => {
          console.log('Products retrieved:', response);
        }),
        catchError(this.handleError)
      );
  }


  /**
   * Crea un nuevo producto (solo ADMIN)
   * @param productData Datos del producto a crear
   * @returns Observable con el producto creado
   */
  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.BASE_URL, productData)
      .pipe(
        tap(product => {
          console.log('Product created successfully:', product);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un producto existente (solo ADMIN)
   * @param id ID del producto
   * @param productData Datos del producto a actualizar
   * @returns Observable con el producto actualizado
   */
  updateProduct(id: string, productData: Partial<CreateProductRequest>): Observable<Product> {
    return this.http.put<Product>(`${this.BASE_URL}/${id}`, productData)
      .pipe(
        tap(product => {
          console.log('Product updated successfully:', product);
        }),
        catchError(this.handleError)
      );
  }



  /**
   * Busca productos por nombre
   * @param name Nombre a buscar
   * @param page Número de página
   * @param size Tamaño de página
   * @returns Observable con la respuesta paginada de productos
   */
  searchProductsByName(name: string, page: number = 0, size: number = 20): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductsResponse>(`${this.BASE_URL}/search`, { params })
      .pipe(
        tap(response => {
          console.log('Products search results:', response);
        }),
        catchError(this.handleError)
      );
  }



  /**
   * Maneja errores HTTP
   * @param error Error HTTP
   * @returns Observable con error procesado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos. Verifica la información enviada.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicia sesión para continuar.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Producto no encontrado.';
          break;
        case 409:
          errorMessage = 'El producto ya existe o hay un conflicto con los datos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    
    console.error('ProductService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
