import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExtraInfoEntry {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  product?: { name: string };
}

@Injectable({ providedIn: 'root' })
export class ExtraInfoService {
  private baseUrl = 'https://peaceful-unity-production.up.railway.app/api/products';

  constructor(private http: HttpClient) {}

  getAllExtraInfo(productId: number): Observable<ExtraInfoEntry[]> {
    return this.http.get<ExtraInfoEntry[]>(`${this.baseUrl}/${productId}/extra-info`);
  }

  getExtraInfoById(productId: number, id: number): Observable<ExtraInfoEntry> {
    return this.http.get<ExtraInfoEntry>(`${this.baseUrl}/${productId}/extra-info/${id}`);
  }
} 