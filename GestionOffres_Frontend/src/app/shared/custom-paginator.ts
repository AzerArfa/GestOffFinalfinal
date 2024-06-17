// src/app/shared/custom-paginator.ts
import { MatPaginatorIntl } from '@angular/material/paginator';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();

  customPaginatorIntl.itemsPerPageLabel = 'Articles par page:';
  customPaginatorIntl.nextPageLabel = 'Page suivante';
  customPaginatorIntl.previousPageLabel = 'Page précédente';
  customPaginatorIntl.firstPageLabel = 'Première page';
  customPaginatorIntl.lastPageLabel = 'Dernière page';

  return customPaginatorIntl;
}
