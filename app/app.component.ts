import { Component, VERSION, ViewChild } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";

class Person {
  id: number;
  firstName: string;
  lastName: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent {
  // version = 'Angular: v' + VERSION.full;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger = new Subject();
  persons: Person[];
  deleterow(person) {
    console.log(person);
    //here do delete process
    const that = this;
    this.rerender();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.initialize();
  }
  initialize() {
    const that = this;
    this.dtOptions = {
      pagingType: "full_numbers",
      responsive: true,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            "https://angular-datatables-demo-server.herokuapp.com/",
            dataTablesParameters,
            {}
          )
          .subscribe(resp => {
            that.persons = resp.data;
            console.log(resp.data);

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: [
        { data: "id" },
        { data: "firstName", class: "none" },
        { data: "lastName" }
      ]
    };
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
}
