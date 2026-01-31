import { Component } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { TestDriveService } from '../../../services/test-drive.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-drives',
  imports: [FormsModule, CommonModule],
  templateUrl: './test-drives.html',
  styleUrl: './test-drives.css',
})
export class TestDrives {

  testDrives: any[] = [];
  loading = true;

  constructor(
    private testDriveService: TestDriveService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.testDriveService.getAll().subscribe({
      next: res => {
        this.testDrives = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  approve(td: any) {
    this.testDriveService.approve(td.id).subscribe(() => {
      td.status = 'Approved';
      this.toast.success('Test drive approved');
    });
  }

  reject(td: any) {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;

    this.testDriveService.reject(td.id, reason).subscribe(() => {
      td.status = 'Rejected';
      td.adminComment = reason;
      this.toast.warning('Test drive rejected');
    });
  }

  complete(td: any) {
    this.testDriveService.complete(td.id).subscribe(() => {
      td.status = 'Completed';
      this.toast.success('Test drive completed');
    });
  }

}
