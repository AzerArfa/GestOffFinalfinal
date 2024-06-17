import { Component, OnInit, ViewChild } from '@angular/core';
import { Entreprise } from '../model/entreprise.model'; // Ensure path is correct
import { UserService } from '../services/user.service'; // Ensure UserService is correctly imported and has the getAllEntreprises method
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-list-entreprises',
  templateUrl: './listentreprises.component.html',
  styleUrls: ['./listentreprises.component.css'] // Assuming you have corresponding CSS
})
export class ListentreprisesComponent implements OnInit {
  entreprises: Entreprise[] = [];
  paginatedEntreprises: Entreprise[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getallentreprises().subscribe({
      next: (entreprises) => {
        this.entreprises = entreprises;
        this.updatePage();
      },
      error: (error) => {
        console.error('Failed to load entreprises:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe((event: PageEvent) => {
      this.updatePage(event);
    });
  }

  updatePage(event?: PageEvent) {
    const pageIndex = event ? event.pageIndex : 0;
    const pageSize = event ? event.pageSize : 5; // default page size
    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;
    this.paginator.length = this.entreprises.length;
    this.paginatedEntreprises = this.entreprises.slice(
      pageIndex * pageSize,
      pageIndex * pageSize + pageSize
    );
  }
  updatePagination() {
    const pageSize = this.paginator.pageSize;
    const pageIndex = this.paginator.pageIndex;
    this.paginator.length = this.paginatedEntreprises.length; // Update the total length based on filtered data
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    this.paginatedEntreprises = this.paginatedEntreprises.slice(start, end); // Slice the paginatedUsers for current page display
  }

  onKeyUp(searchTerm: string) {
    // Filter the `paginatedEntreprises` array based on the search term
    this.paginatedEntreprises = this.entreprises.filter(entreprise =>
      entreprise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.updatePagination();
  }
  
}
