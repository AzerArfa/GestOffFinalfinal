import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { UserService } from '../services/user.service';
import { Entreprise } from '../model/entreprise.model';
import { AppeloffreService } from '../services/appeloffre.service';
import { Categorie } from '../model/categorie.model';

@Component({
  selector: 'app-superadmin-dashboard',
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.css']
})
export class SuperadminDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  collection!: number;
  appelOffresCount!: number;
  entrepriseCount!: number;
  usersCount!: number;
  moneyFilterOptions = ['today', 'lastMonth', 'lastYear'];
  currentMoneyFilterIndex = 0;
  categories: Categorie[] = [];
  appelOffresFilterOptions = ['today', 'lastMonth', 'lastYear'];
  currentAppelOffresFilterIndex = 0;
  entreprises: Entreprise[] = [];
  filteredEntreprises: Entreprise[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  totalMontantMap: { [key: string]: number } = {};
  appelOffresCountMap: { [key: string]: number } = {};
  sortAscending: boolean = true;
  appelOffresSortAscending: boolean = true;
  isTotalMontantTable: boolean = true;

  itemsPerPage = 3;
  currentPage = 0; 

  constructor(private appeloffreService: AppeloffreService, private userService: UserService) { }

  ngOnInit(): void {
    this.loadCollection(this.moneyFilterOptions[this.currentMoneyFilterIndex]);
    this.loadAppelOffresCount(this.appelOffresFilterOptions[this.currentAppelOffresFilterIndex]);
    this.loadEntrepriseCount();
    this.loadCategories();
    this.loadAllEntreprises();
    this.loadUsersCount();
    this.userService.getallentreprises().subscribe({
      next: (entreprises) => {
        this.entreprises = entreprises;
        this.filteredEntreprises = entreprises;
        this.onDateRangeChange();
      },
      error: (error) => {
        console.error('Failed to load entreprises:', error);
      }
    });
  }

  loadEntrepriseCount(): void {
    this.userService.getEntrepriseCount().subscribe(data => {
      this.entrepriseCount = data;
    });
  }

  loadUsersCount(): void {
    this.userService.getUsersCount().subscribe(data => {
      this.usersCount = data;
    });
  }

  loadCategories(): void {
    this.appeloffreService.getAllCategoriesSuperadmin().subscribe(categories => {
      this.categories = [{ id: '', nomcategorie: 'Tous les categories', description: '', appelOffresCount: 0 }, ...categories];
    });
  }

  loadAllEntreprises(): void {
    this.userService.getallentreprises().subscribe(entreprises => {
      this.entreprises = entreprises;
      this.filteredEntreprises = entreprises;
    });
  }

  onCategoryChange(categoryId: string): void {
    if (categoryId) {
      this.userService.getEntreprisesByCategoryId(categoryId).subscribe({
        next: (entreprises) => {
          console.log(`Entreprises fetched for category ${categoryId}:`, entreprises); // Log fetched entreprises
          this.filteredEntreprises = entreprises;
          this.currentPage = 0; // Reset to the first page
        },
        error: (error) => {
          console.error(`Failed to fetch entreprises for category ${categoryId}:`, error);
        }
      });
    } else {
      this.filteredEntreprises = this.entreprises; // Show all entreprises if "Tous les categories" is selected
      this.currentPage = 0; // Reset to the first page
    }
  }

  loadCollection(filter: string): void {
    switch (filter) {
      case 'today':
        this.appeloffreService.getTotalMontantToday().subscribe(data => {
          this.collection = data;
        });
        break;
      case 'lastMonth':
        this.appeloffreService.getTotalMontantLastMonth().subscribe(data => {
          this.collection = data;
        });
        break;
      case 'lastYear':
        this.appeloffreService.getTotalMontantLastYear().subscribe(data => {
          this.collection = data;
        });
        break;
      default:
        break;
    }
  }

  loadAppelOffresCount(filter: string): void {
    switch (filter) {
      case 'today':
        this.appeloffreService.getCountAppelOffresToday().subscribe(data => {
          this.appelOffresCount = data;
        });
        break;
      case 'lastMonth':
        this.appeloffreService.getCountAppelOffresLastMonth().subscribe(data => {
          this.appelOffresCount = data;
        });
        break;
      case 'lastYear':
        this.appeloffreService.getCountAppelOffresLastYear().subscribe(data => {
          this.appelOffresCount = data;
        });
        break;
      default:
        break;
    }
  }

  onMoneyFilterButtonClick(): void {
    this.currentMoneyFilterIndex = (this.currentMoneyFilterIndex + 1) % this.moneyFilterOptions.length;
    this.loadCollection(this.moneyFilterOptions[this.currentMoneyFilterIndex]);
  }

  onAppelOffresFilterButtonClick(): void {
    this.currentAppelOffresFilterIndex = (this.currentAppelOffresFilterIndex + 1) % this.appelOffresFilterOptions.length;
    this.loadAppelOffresCount(this.appelOffresFilterOptions[this.currentAppelOffresFilterIndex]);
  }

  getMoneyFilterLabel(): string {
    switch (this.moneyFilterOptions[this.currentMoneyFilterIndex]) {
      case 'today':
        return "Aujourd'hui";
      case 'lastMonth':
        return 'Dernier 30 jours';
      case 'lastYear':
        return 'Dernier année';
      default:
        return '';
    }
  }

  getAppelOffresFilterLabel(): string {
    switch (this.appelOffresFilterOptions[this.currentAppelOffresFilterIndex]) {
      case 'today':
        return "Aujourd'hui";
      case 'lastMonth':
        return 'Dernier 30 jours';
      case 'lastYear':
        return 'Dernier année';
      default:
        return '';
    }
  }

  onDateRangeChange(): void {
    if (this.isTotalMontantTable) {
      this.appeloffreService.getTotalMontantByEntrepriseIdAndDateRange(this.startDate.toISOString().split('T')[0], this.endDate.toISOString().split('T')[0]).subscribe(data => {
        this.totalMontantMap = data;
        this.sortEntreprisesByTotalMontant();
      });
    } else {
      this.appeloffreService.countAppelOffresByEntrepriseIdAndDateRange(this.startDate.toISOString().split('T')[0], this.endDate.toISOString().split('T')[0]).subscribe(data => {
        this.appelOffresCountMap = data;
        this.sortEntreprisesByAppelOffres();
      });
    }
  }

  sortEntreprisesByTotalMontant(): void {
    this.filteredEntreprises.sort((a, b) => {
      const montantA = this.totalMontantMap[a.id] || 0;
      const montantB = this.totalMontantMap[b.id] || 0;
      return this.sortAscending ? montantB - montantA : montantA - montantB;
    });
  }

  sortEntreprisesByAppelOffres(): void {
    this.filteredEntreprises.sort((a, b) => {
      const countA = this.appelOffresCountMap[a.id] || 0;
      const countB = this.appelOffresCountMap[b.id] || 0;
      return this.appelOffresSortAscending ? countB - countA : countA - countB;
    });
  }

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.sortEntreprisesByTotalMontant();
  }

  toggleAppelOffresSortOrder(): void {
    this.appelOffresSortAscending = !this.appelOffresSortAscending;
    this.sortEntreprisesByAppelOffres();
  }

  showTotalMontantTable(): void {
    this.isTotalMontantTable = true;
    this.onDateRangeChange();
  }

  showAppelOffresTable(): void {
    this.isTotalMontantTable = false;
    this.onDateRangeChange();
  }

  getPagedData(): Entreprise[] {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.filteredEntreprises.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(event: PageEvent): void {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;
  }
}
