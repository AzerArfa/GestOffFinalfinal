import { Component, OnInit, ViewChild } from '@angular/core';
import { AppeloffreService } from '../services/appeloffre.service';
import { UserService } from '../services/user.service';  // Make sure you import UserService
import { AppelOffre } from '../model/appeloffre.model';
import { AuthService } from '../services/auth.service';
import { User } from '../model/user.model';  // Assuming you have a User model with a structure that includes entreprises
import { Categorie } from '../model/categorie.model';
import { MatSelectChange } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  appeloffres: AppelOffre[] = [];
  paginatedAppeloffres: AppelOffre[] = [];
  isLoading = true; // Track loading state
  hasEntreprises: boolean = false;
  categories: Categorie[] = [];
  selectedCategoryId: string = '';
  pageSize: number = 8;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private appeloffreService: AppeloffreService,
    private authService: AuthService,
    private userService: UserService  // Inject UserService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.loadUserDetails();
    this.loadAllAppelOffres();
    this.hasEntreprises = this.authService.hasEntreprises();
  }

  fetchCategories(): void {
    this.appeloffreService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error fetching categories:', error)
    });
  }

  private loadUserDetails(): void {
    this.authService.getUserId().subscribe(userId => {
      if (userId) {
        this.userService.getUserById(userId).subscribe({
          next: (user: User) => {
            this.hasEntreprises = Array.isArray(user.entreprises) && user.entreprises.length > 0;
          },
          error: (error) => {
            console.error('Failed to fetch user data:', error);
            this.hasEntreprises = false;  // Set to false or handle appropriately
          }
        });
      } else {
        console.error('No user ID found');
        this.hasEntreprises = false;  // Handle situation where no user ID is available
      }
    });
  }

  loadAllAppelOffres(): void {
    this.isLoading = true;
    if (this.selectedCategoryId) {
      this.appeloffreService.getAppelOffresByCategorieId(this.selectedCategoryId)
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
      this.appeloffreService.getAllAppelOffresuser().subscribe({
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

  onCategorySelected(event: MatSelectChange): void {
    this.selectedCategoryId = event.value;
    this.paginator.pageIndex = 0; // Reset to the first page when changing the category
    this.loadAllAppelOffres(); // Call loadAllAppelOffres whether a specific category is selected or not
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
