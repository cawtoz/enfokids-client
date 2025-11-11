import axios, { type AxiosInstance } from "axios"

export interface CRUDService<T, TCreateUpdate = Omit<T, 'id'>> {
  getAll(): Promise<T[]>
  getById(id: number | string): Promise<T>
  create(data: TCreateUpdate): Promise<T>
  update(id: number | string, data: TCreateUpdate): Promise<T>
  delete(id: number | string): Promise<void>
}

export class GenericCRUDService<T, TCreateUpdate = Omit<T, 'id'>> 
  implements CRUDService<T, TCreateUpdate> {
  
  private client: AxiosInstance
  
  constructor(private baseUrl: string, private endpoint: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async getAll(): Promise<T[]> {
    const response = await this.client.get<T[]>(this.endpoint)
    return response.data
  }

  async getById(id: number | string): Promise<T> {
    const response = await this.client.get<T>(`${this.endpoint}/${id}`)
    return response.data
  }

  async create(data: TCreateUpdate): Promise<T> {
    const response = await this.client.post<T>(this.endpoint, data)
    return response.data
  }

  async update(id: number | string, data: TCreateUpdate): Promise<T> {
    const response = await this.client.put<T>(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async delete(id: number | string): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`)
  }
}
