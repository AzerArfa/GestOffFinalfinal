import { Component, OnInit, ViewChild } from '@angular/core';
import { AppeloffreService } from '../services/appeloffre.service';
import { Categorie } from '../model/categorie.model';
import { MatSelectChange } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-homevisitor',
  templateUrl: './homevisitor.component.html',
  styleUrls: ['./homevisitor.component.css']
})
export class HomevisitorComponent implements OnInit {
  appeloffres: any[] = [];
  paginatedAppeloffres: any[] = [];
  isLoading = true;
  categories: Categorie[] = [];
  selectedCategoryId: string = '';
  pageSize: number = 8;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private appeloffreService: AppeloffreService) {}

  ngOnInit(): void {
    this.loadAllAppelOffres();
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.appeloffreService.getAllCategoriesVISITOR().subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => console.error('Error fetching categories:', error)
    });
  }

  onCategorySelected(event: MatSelectChange): void {
    this.selectedCategoryId = event.value;
    this.paginator.pageIndex = 0; // Reset to the first page when changing the category
    this.loadAllAppelOffres(); // Call loadAllAppelOffres whether a specific category is selected or not
  }
  
  loadAllAppelOffres(): void {
    this.isLoading = true;
    if (this.selectedCategoryId) {
      this.appeloffreService.getAppelOffresByCategorieIdVISITOR(this.selectedCategoryId)
        .subscribe({
          next: (appeloffres) => {
            this.appeloffres = appeloffres || []; // Ensure appeloffres is always an array
            this.isLoading = false;
            this.updatePage();
          },
          error: (error) => {
            console.error('Failed to load appeloffres by category:', error);
            this.appeloffres = []; // Reset to an empty array on error
            this.isLoading = false;
            this.updatePage();
          }
        });
    } else {
      // Load all appeloffres if no specific category is selected
      this.appeloffreService.getAllAppelOffresvisitor().subscribe({
        next: (appeloffres) => {
          this.appeloffres = appeloffres;
          this.isLoading = false;
          this.updatePage();
        },
        error: (error) => {
          console.error('Failed to load all appeloffres:', error);
          this.appeloffres = [];
          this.isLoading = false;
          this.updatePage();
        },
      });
    }
  }
  

  onPageChange(event: PageEvent): void {
    this.updatePage(event);
  }

  updatePage(event?: PageEvent): void {
    const pageIndex = event ? event.pageIndex : 0;
    const pageSize = event ? event.pageSize : this.pageSize;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    this.paginatedAppeloffres = this.appeloffres.slice(startIndex, endIndex);
  }
}
