export interface Category {
  id: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: string;
  sku: string;
  name: string;
  shortDescription: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  shortDescription: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: {
    id: string;
  };
}

export interface CreateCategoryRequest {
  name: string;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CategoriesResponse {
  content: Category[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}
