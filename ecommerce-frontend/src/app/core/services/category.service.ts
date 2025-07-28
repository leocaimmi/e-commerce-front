import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryRequest, CategoriesResponse } from '../interfaces/Product';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  private readonly BASE_URL = `${environment.apiUrl}api/v1/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías con paginación
   * @param page Número de página (0-based)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc, desc)
   * @returns Observable con la respuesta paginada de categorías
   */
  getCategories(page: number = 0, size: number = 50, sortBy: string = 'name'): Observable<CategoriesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy}`);

    return this.http.get<CategoriesResponse>(this.BASE_URL, { params })
      .pipe(
        tap(response => {
          console.log('Categories retrieved:', response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todas las categorías sin paginación (para dropdowns)
   * @returns Observable con array de categorías
   */
  getAllCategoriesSimple(): Observable<Category[]> {
    const params = new HttpParams()
      .set('size', '1000'); // Obtener todas las categorías

    return this.http.get<CategoriesResponse>(this.BASE_URL, { params })
      .pipe(
        tap(response => {
          console.log('All categories retrieved:', response.content);
        }),
        map(response => response.content), // Extraer solo el contenido
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría
   * @returns Observable con la categoría
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.BASE_URL}/${id}`)
      .pipe(
        tap(category => {
          console.log('Category retrieved:', category);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Crea una nueva categoría (solo ADMIN)
   * @param categoryData Datos de la categoría a crear
   * @returns Observable con la categoría creada
   */
  createCategory(categoryData: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.BASE_URL, categoryData)
      .pipe(
        tap(category => {
          console.log('Category created successfully:', category);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una categoría existente (solo ADMIN)
   * @param id ID de la categoría
   * @param categoryData Datos de la categoría a actualizar
   * @returns Observable con la categoría actualizada
   */
  updateCategory(id: string, categoryData: Partial<CreateCategoryRequest>): Observable<Category> {
    return this.http.put<Category>(`${this.BASE_URL}/${id}`, categoryData)
      .pipe(
        tap(category => {
          console.log('Category updated successfully:', category);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una categoría (solo ADMIN)
   * @param id ID de la categoría
   * @returns Observable vacío
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`)
      .pipe(
        tap(() => {
          console.log('Category deleted successfully:', id);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca categorías por nombre
   * @param name Nombre a buscar
   * @param page Número de página
   * @param size Tamaño de página
   * @returns Observable con la respuesta paginada de categorías
   */
  searchCategoriesByName(name: string, page: number = 0, size: number = 20): Observable<CategoriesResponse> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CategoriesResponse>(`${this.BASE_URL}/search`, { params })
      .pipe(
        tap(response => {
          console.log('Categories search results:', response);
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
          errorMessage = 'Categoría no encontrada.';
          break;
        case 409:
          errorMessage = 'La categoría ya existe o hay un conflicto con los datos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    
    console.error('CategoryService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
